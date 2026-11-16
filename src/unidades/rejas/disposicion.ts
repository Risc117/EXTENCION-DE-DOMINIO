import type { DatosRejas } from './esquema'

/** Dónde cae cada tramo a lo largo del flujo (x, en metros desde el centro de la unidad) y a lo ancho (z). */
export interface Disposicion {
  largoTotal: number
  /** x del inicio de la recepción, de la transición, de la zona de rejas y de la salida; y x del final. */
  xRecepcion: number
  xTransicion: number
  xReja: number
  xSalida: number
  xFin: number
  /** x del pie y de la cabeza de la reja inclinada. */
  xPieReja: number
  xCabezaReja: number
  /** z del centro del by-pass (el canal principal está en 0) y de los muros divisorio y exterior. */
  zBypass: number
  zMuroDivisorio: number
  zMuroExterior: number
  /** x donde empieza y termina el vertedero del by-pass. */
  xVertedero: [number, number]
}

export function disponer(d: DatosRejas): Disposicion {
  const e = d.canal.espesorMuro.valor
  const b = d.canal.ancho.valor
  const bb = d.bypass.anchoCanal.valor
  const angulo = (d.reja.angulo.valor * Math.PI) / 180
  const proyeccion = d.reja.largo.valor * Math.cos(angulo)
  const zonaReja = proyeccion
  const largoTotal = d.recepcion.largo.valor + d.transicion.largo.valor + zonaReja + d.canal.largoSalida.valor
  const x0 = -largoTotal / 2
  const xTransicion = x0 + d.recepcion.largo.valor
  const xReja = xTransicion + d.transicion.largo.valor
  const xSalida = xReja + zonaReja
  const xPieReja = xReja
  const centroReja = xReja + zonaReja / 2
  const lv = Math.min(d.bypass.largoVertedero.valor, zonaReja)
  return {
    largoTotal,
    xRecepcion: x0,
    xTransicion,
    xReja,
    xSalida,
    xFin: x0 + largoTotal,
    xPieReja,
    xCabezaReja: xPieReja + proyeccion,
    zBypass: b / 2 + e + bb / 2,
    zMuroDivisorio: b / 2 + e / 2,
    zMuroExterior: b / 2 + e + bb + e / 2,
    xVertedero: [centroReja - lv / 2, centroReja + lv / 2],
  }
}
