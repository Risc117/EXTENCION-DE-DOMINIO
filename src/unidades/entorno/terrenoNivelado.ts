import { alturaEn, nivelarFuentes, type Cuadricula, type InformeNivel } from '../../nucleo/terreno'
import { ALCANCE_MAXIMO_NIVELACION, PASO_PERFIL_VIA, PASO_TALUD, UMBRAL_HIDRAULICO } from '../../nucleo/constantesEntorno'
import { distanciaProtegida } from '../comun/protegido'
import { terrenoUnidades } from '../comun/terrenoPlanta'
import { entorno } from './datos'
import type { PuntoPlano } from './esquema'
import { cotaEnPerfil, fuentePlataforma, fuenteVia, perfilVia, type PerfilVia } from './nivelacion'

export interface TerrenoNivelado {
  cuadricula: Cuadricula
  informe: InformeNivel[]
  /** true si el perfil de la vía respeta la pendiente máxima (con la parte anclada por la explanada del RAFA, no siempre se puede). */
  viaCumple: boolean
  /** Cota (m s.n.m.) de la vía interna en (x, y), según su perfil suave. */
  alturaVia: (x: number, y: number) => number
  /** Las estaciones del perfil de la vía (cota y si quedó anclada al terreno). */
  viaEstaciones: PerfilVia['estaciones']
  /** Pendiente (m por m) del terreno bajo el tramo anclado de la vía (explanada del RAFA), que no se modifica. */
  pendienteAnclada: number
}

const guardados = new Map<number, TerrenoNivelado>()

/** Plataformas: los edificios con el mismo `plataforma` comparten una (con su cota); los demás tienen la suya. En el orden de aparición. */
function plataformasDe(): { id: string; poligonos: PuntoPlano[][]; cotaPiso: number }[] {
  const lista: { id: string; poligonos: PuntoPlano[][]; cotaPiso: number }[] = []
  for (const e of entorno.edificios) {
    const id = e.plataforma ?? e.id
    const existente = lista.find((p) => p.id === id)
    if (existente) existente.poligonos.push(e.poligono)
    else lista.push({ id, poligonos: [e.poligono], cotaPiso: e.cotaPiso.valor })
  }
  return lista
}

/** Terreno de la escena: el aplanado de las unidades, más las plataformas de los edificios y la vía interna a su propia altura (T16.8). Las unidades, tuberías y buzones no cambian. */
export function terrenoNivelado(salto = 1): TerrenoNivelado {
  let r = guardados.get(salto)
  if (!r) {
    const base = terrenoUnidades(salto)
    const n = entorno.nivelacion
    const via = entorno.vias.find((v) => v.id === n.via)!
    const perfil = perfilVia(
      { eje: via.eje, ancho: via.ancho.valor, borde: n.borde.valor, paso: PASO_PERFIL_VIA, ventana: n.ventanaSuavizado.valor, pendienteMaxima: n.pendienteMaxima.valor, intactas: n.viaIntacta.unidades },
      (x, y) => alturaEn(terrenoUnidades(1), x, y) ?? 0,
    )
    const fuentes = [
      ...plataformasDe().map((p) => fuentePlataforma(p.id, p.poligonos, p.cotaPiso, n.borde.valor, ALCANCE_MAXIMO_NIVELACION)),
      fuenteVia(via.id, perfil, via.ancho.valor, n.borde.valor, ALCANCE_MAXIMO_NIVELACION),
    ]
    const { cuadricula, informe } = nivelarFuentes(base, fuentes, distanciaProtegida, {
      taludMaximo: n.talud.valor,
      taludMinimo: n.taludMinimo.valor,
      paso: PASO_TALUD,
      holgura: Math.max(n.holgura.valor, base.paso * Math.SQRT2),
      umbral: UMBRAL_HIDRAULICO,
    })
    r = { cuadricula, informe, viaCumple: perfil.cumple, alturaVia: (x, y) => cotaEnPerfil(perfil, x, y), pendienteAnclada: perfil.pendienteAnclada, viaEstaciones: perfil.estaciones }
    guardados.set(salto, r)
  }
  return r
}

/** Cota (m s.n.m.) del terreno de la escena con edificios y vía nivelados; -Infinity fuera de la malla. */
export function alturaNivelada(x: number, y: number): number {
  return alturaEn(terrenoNivelado(1).cuadricula, x, y) ?? Number.NEGATIVE_INFINITY
}
