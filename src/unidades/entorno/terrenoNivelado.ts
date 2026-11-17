import { alturaEn, nivelarFuentes, type Cuadricula, type InformeNivel } from '../../nucleo/terreno'
import { ALCANCE_MAXIMO_NIVELACION, DESFASE_VIA_SOBRE_TERRENO, PASO_PERFIL_VIA, PASO_TALUD, TOLERANCIA_VIA_NIVELADA, UMBRAL_HIDRAULICO } from '../../nucleo/constantesEntorno'
import { distanciaProtegida } from '../comun/protegido'
import { terrenoUnidades } from '../comun/terrenoPlanta'
import { entorno } from './datos'
import { cotaEnPerfil, distanciaPolilinea, fuentePlataforma, fuenteVia, perfilVia, plataformasDe, tramosSinNivelar, type PerfilVia, type TramoSinNivelar } from './nivelacion'

/** Una vía nivelada: su perfil suave y si lo logró. */
export interface ViaNivelada {
  /** Estaciones del perfil (cota y si quedó anclada al terreno). */
  estaciones: PerfilVia['estaciones']
  /** true si respeta la pendiente máxima (salvo entre estaciones ancladas, que siguen al terreno). */
  cumple: boolean
  /** Pendiente (m por m) del terreno bajo el tramo anclado (explanada del RAFA), que no se modifica. */
  pendienteAnclada: number
  /** Cota (m s.n.m.) de la vía en (x, y), según su perfil suave. */
  cota: (x: number, y: number) => number
  /** Cota (m s.n.m.) a la que se dibuja la cinta: la del perfil, o la del terreno con un pequeño desfase hacia arriba donde el terreno no pudo modificarse (nunca queda bajo el suelo). */
  cinta: (x: number, y: number) => number
  /** Rachas de estaciones donde el terreno quedó distinto del perfil (cerca de lo hidráulico, anclada por el RAFA o cruce con otra vía). */
  sinNivelar: TramoSinNivelar[]
}

export interface TerrenoNivelado {
  cuadricula: Cuadricula
  /** Una entrada por vía y por plataforma, en el orden en que se aplicaron. */
  informe: InformeNivel[]
  vias: Record<string, ViaNivelada>
}

const guardados = new Map<number, TerrenoNivelado>()

/** Terreno de la escena: el aplanado de las unidades, más las vías (perfil suave), los pavimentos y los edificios a su propia cota, en corte (T16.8, T16.8.3). Las unidades, tuberías y buzones no cambian. */
export function terrenoNivelado(salto = 1): TerrenoNivelado {
  let r = guardados.get(salto)
  if (!r) {
    const base = terrenoUnidades(salto)
    const n = entorno.nivelacion
    const crudo = (x: number, y: number) => alturaEn(terrenoUnidades(1), x, y) ?? 0
    const vias: Record<string, ViaNivelada> = {}
    const fuentes = []
    let anterior: ViaNivelada | null = null
    for (const id of n.vias) {
      const via = entorno.vias.find((v) => v.id === id)!
      const inicio = via.eje[0]
      // Una vía que parte de otra (el cruce del portón) empieza a su misma cota para que no haya escalón.
      const cruce = anterior?.estaciones.some((e) => Math.hypot(e.x - inicio.x, e.y - inicio.y) <= PASO_PERFIL_VIA)
      const perfil = perfilVia(
        { eje: via.eje, ancho: via.ancho.valor, borde: n.borde.valor, paso: PASO_PERFIL_VIA, ventana: n.ventanaSuavizado.valor, pendienteMaxima: n.pendienteMaxima.valor, intactas: n.viaIntacta.unidades, cotaInicio: cruce && anterior ? anterior.cota(inicio.x, inicio.y) : undefined },
        crudo,
      )
      const cota = (x: number, y: number) => cotaEnPerfil(perfil, x, y)
      const nivelada: ViaNivelada = { estaciones: perfil.estaciones, cumple: perfil.cumple, pendienteAnclada: perfil.pendienteAnclada, cota, cinta: cota, sinNivelar: [] }
      vias[id] = nivelada
      anterior = nivelada
      fuentes.push(fuenteVia(id, perfil, via.ancho.valor, n.borde.valor, ALCANCE_MAXIMO_NIVELACION))
    }
    fuentes.push(...plataformasDe(entorno).map((p) => fuentePlataforma(p.id, p.poligonos, p.cotaPiso, n.borde.valor, ALCANCE_MAXIMO_NIVELACION)))
    const { cuadricula, informe } = nivelarFuentes(base, fuentes, distanciaProtegida, {
      taludMaximo: n.talud.valor,
      taludMinimo: n.taludMinimo.valor,
      paso: PASO_TALUD,
      holgura: Math.max(n.holgura.valor, base.paso * Math.SQRT2),
      umbral: UMBRAL_HIDRAULICO,
    })
    // La cinta sigue al perfil, pero nunca queda bajo el terreno; y se anotan las rachas donde el terreno no se pudo llevar al perfil.
    const terrenoFinal = (x: number, y: number) => alturaEn(cuadricula, x, y) ?? Number.NEGATIVE_INFINITY
    const holgura = Math.max(n.holgura.valor, base.paso * Math.SQRT2)
    n.vias.forEach((id, k) => {
      const via = entorno.vias.find((v) => v.id === id)!
      const v = vias[id]
      v.cinta = (x, y) => Math.max(v.cota(x, y), terrenoFinal(x, y) + DESFASE_VIA_SOBRE_TERRENO)
      v.sinNivelar = tramosSinNivelar(v.estaciones, terrenoFinal, TOLERANCIA_VIA_NIVELADA, (x, y, i) => {
        if (v.estaciones[i].anclada) return 'anclada al terreno (explanada del RAFA)'
        if (distanciaProtegida(x, y) < holgura + via.ancho.valor / 2 + n.borde.valor) return 'a menos de la holgura de una unidad, tubería o buzón'
        const previa = n.vias.slice(0, k).some((o) => { const q = entorno.vias.find((w) => w.id === o)!; return distanciaPolilinea(x, y, q.eje) <= q.ancho.valor / 2 + n.borde.valor + via.ancho.valor / 2 + n.borde.valor })
        if (previa) return 'cruce con otra vía (manda la primera)'
        // En el último punto la malla de 3 m ve la vía de un solo lado y no sigue su pendiente exacta.
        return i === v.estaciones.length - 1 ? 'extremo de la vía (la malla de 3 m no sigue su pendiente exacta)' : 'sin explicar'
      })
    })
    r = { cuadricula, informe, vias }
    guardados.set(salto, r)
  }
  return r
}

/** Cota (m s.n.m.) del terreno de la escena con vías, pavimentos y edificios nivelados; -Infinity fuera de la malla. */
export function alturaNivelada(x: number, y: number): number {
  return alturaEn(terrenoNivelado(1).cuadricula, x, y) ?? Number.NEGATIVE_INFINITY
}
