import type { DatosBombeo } from './esquema'

/** Medidas derivadas del cárcamo y la caseta (x hacia la caseta, que mira al pretratamiento). */
export interface DisposicionBombeo {
  radioInterior: number
  radioExterior: number
  /** Profundidad del cárcamo = altura del muro; el terreno queda en y = profundidad. */
  profundidad: number
  /** Centro de la caseta en x, y límites de la caseta en x. */
  xCaseta: number
  xCasetaInicio: number
  xCasetaFin: number
  /** Altura (y) de las tuberías de cada bomba al salir del cárcamo, y de la tubería de impulsión dentro de la caseta. */
  yColector: number
  yImpulsion: number
  /** z de cada bomba (se reparten parejo respecto del eje). */
  zBombas: number[]
  /** x del eje de las bombas. */
  xBombas: number
  /** Semiancho de la unidad (m): lo que se aleja del eje el punto más lejano. */
  semiancho: number
  largoTotal: number
}

export function disponer(d: DatosBombeo): DisposicionBombeo {
  const radioInterior = d.carcamo.diametroInterior.valor / 2
  const radioExterior = radioInterior + d.carcamo.espesorMuro.valor
  const profundidad = d.carcamo.profundidad.valor
  const n = d.bombas.cantidad.valor
  const separacion = d.bombas.separacion.valor
  const xCasetaInicio = radioExterior + d.caseta.distancia.valor
  const xCaseta = xCasetaInicio + d.caseta.largo.valor / 2
  const xCasetaFin = xCasetaInicio + d.caseta.largo.valor
  return {
    radioInterior,
    radioExterior,
    profundidad,
    xCaseta,
    xCasetaInicio,
    xCasetaFin,
    yColector: profundidad - d.disposicion.bajoTerrenoColector.valor,
    yImpulsion: profundidad + d.disposicion.sobreTerrenoImpulsion.valor,
    zBombas: Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * separacion),
    xBombas: d.disposicion.desplazamientoBombas.valor,
    semiancho: Math.max(radioExterior, d.caseta.ancho.valor / 2),
    largoTotal: radioExterior + xCasetaFin + d.impulsion.largoTramo.valor,
  }
}
