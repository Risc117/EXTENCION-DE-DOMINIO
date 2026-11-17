import crudo from '../../../datos/perfil.json'
import type { BuzonPerfil, DatosPerfil, PuntoPerfil, SegmentoPerfil, UnidadPerfil } from '../../estado/perfil'
import { PASO_MUESTRA_PERFIL, PASO_PERFIL_TUBO } from '../../nucleo/constantesPerfil'
import { alturaTerreno } from '../comun/terrenoPlanta'
import { planta as plantaDatos } from '../planta'
import type { DatosPlanta } from '../planta/esquema'
import { conexiones } from './datos'
import type { DatosConexiones } from './esquema'
import { esquemaPerfil, type DatosCadena } from './perfilEsquema'
import { longitudTramo, perfilTramo } from './trazado'

type TerrenoEn = (x: number, y: number) => number

/**
 * Perfil hidráulico de la línea de agua: la línea de tuberías (cota de fondo), el terreno, las unidades (fondo a coronación) y los buzones, por progresiva.
 * La progresiva es la distancia acumulada en planta desde la entrada de agua residual; por dentro de las unidades la línea va recta entre el tramo que llega y el que sale.
 */
export function construirPerfil(c: DatosCadena, d: DatosConexiones, pl: DatosPlanta, terrenoEn: TerrenoEn): DatosPerfil {
  const segmentos: SegmentoPerfil[] = []
  const terreno: PuntoPerfil[] = []
  const unidades: UnidadPerfil[] = []
  const buzones: BuzonPerfil[] = []
  let s = 0
  let fin: { x: number; y: number; cota: number } | null = null
  let hayEjemplo = false

  c.cadena.forEach((item, i) => {
    if (item.tipo === 'tramo') {
      const t = d.tramos.find((x) => x.id === item.id)!
      const pts = perfilTramo(t, PASO_PERFIL_TUBO)
      const puntos = pts.map((p) => ({ s: s + p.distancia, cota: p.cota }))
      segmentos.push({ tipo: 'tubo', id: t.id, puntos })
      pts.forEach((p, k) => {
        if (k % Math.max(1, Math.round(PASO_MUESTRA_PERFIL / PASO_PERFIL_TUBO)) === 0 || k === pts.length - 1) terreno.push({ s: s + p.distancia, cota: terrenoEn(p.x, p.y) })
      })
      const buzon = d.puntos.find((p) => p.id === t.hasta && p.tipo === 'buzon')
      if (buzon) buzones.push({ id: buzon.id, s: s + longitudTramo(t), tapa: buzon.cotaTapa!.valor, fondo: t.cotaLlegada.valor, demo: buzon.cotaTapa!.demo === true || t.cotaLlegada.demo === true })
      hayEjemplo = hayEjemplo || t.cotaSalida.demo === true || t.cotaLlegada.demo === true
      s += longitudTramo(t)
      const ultimo = pts[pts.length - 1]
      fin = { x: ultimo.x, y: ultimo.y, cota: ultimo.cota }
    } else {
      // El hueco: de donde terminó el tramo anterior a donde empieza el siguiente; las unidades se reparten el largo.
      const siguiente = c.cadena.slice(i + 1).find((q) => q.tipo === 'tramo')
      const t = siguiente && siguiente.tipo === 'tramo' ? d.tramos.find((x) => x.id === siguiente.id)! : null
      const inicio = fin!
      const meta = t ? { x: t.trazado[0].x, y: t.trazado[0].y, cota: t.cotaSalida.valor } : inicio
      const largo = Math.hypot(meta.x - inicio.x, meta.y - inicio.y)
      item.unidades.forEach((id, k) => {
        const u = pl.unidades.find((q) => q.id === id)!
        const [a, b] = [(k * largo) / item.unidades.length, ((k + 1) * largo) / item.unidades.length]
        const cotaEn = (distancia: number) => inicio.cota + (meta.cota - inicio.cota) * (largo === 0 ? 0 : distancia / largo)
        segmentos.push({ tipo: 'unidad', id, puntos: [{ s: s + a, cota: cotaEn(a) }, { s: s + b, cota: cotaEn(b) }] })
        unidades.push({ id, nombre: u.nombre, desde: s + a, hasta: s + b, fondo: u.cotaFondo.valor, corona: u.cotaCoronacion.valor, demo: u.cotaFondo.demo === true || u.cotaCoronacion.demo === true })
        const f = largo === 0 ? 0 : (a + b) / 2 / largo
        terreno.push({ s: s + (a + b) / 2, cota: terrenoEn(inicio.x + (meta.x - inicio.x) * f, inicio.y + (meta.y - inicio.y) * f) })
      })
      s += largo
      fin = meta
    }
  })

  const cotas = [...terreno.map((p) => p.cota), ...segmentos.flatMap((q) => q.puntos.map((p) => p.cota)), ...unidades.flatMap((u) => [u.fondo, u.corona])]
  return {
    largo: s,
    cotaMinima: Math.min(...cotas),
    cotaMaxima: Math.max(...cotas),
    terreno,
    segmentos,
    unidades,
    buzones,
    hayEjemplo: hayEjemplo || unidades.some((u) => u.demo),
    fuente: `${c.fuente} Cotas de tubería y de buzón: datos/conexiones.json; de fondo y coronación de las unidades: datos/planta.json.`,
  }
}

/** El perfil de la línea de agua de la planta (datos/perfil.json, conexiones.json y planta.json), sobre el terreno aplanado alrededor de las unidades. */
export const perfilPlanta = (): DatosPerfil => construirPerfil(esquemaPerfil.parse(crudo), conexiones, plantaDatos, alturaTerreno)
