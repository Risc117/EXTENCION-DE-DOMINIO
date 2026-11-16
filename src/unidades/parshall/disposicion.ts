import type { DatosParshall } from './esquema'

/** Dónde cae cada tramo a lo largo del flujo (x desde el centro de la unidad; z = 0 es el eje). */
export interface DisposicionParshall {
  largoTotal: number
  /** Inicio del tramo recto de entrada, de la sección convergente, de la garganta, de la divergente y del tramo de salida. */
  xInicio: number
  xConvergente: number
  xGarganta: number
  xDivergente: number
  xSalida: number
  xFin: number
  /** Dónde está el medidor de nivel (m). */
  xMedicion: number
  /** Ancho (m) de la entrada, de la garganta y de la salida. */
  anchoEntrada: number
  anchoGarganta: number
  anchoSalida: number
  semiancho: number
}

export function disponer(d: DatosParshall): DisposicionParshall {
  const wEntrada = d.convergente.anchoEntrada.valor
  const wGarganta = d.garganta.ancho.valor
  const medio = (wEntrada - wGarganta) / 2
  // La hoja da el largo de la pared inclinada (A); el largo a lo largo del eje sale por Pitágoras.
  const largoConvergente = Math.sqrt(d.convergente.largoPared.valor ** 2 - medio ** 2)
  const largoTotal = d.estructura.largoEntrada.valor + largoConvergente + d.garganta.largo.valor + d.divergente.largo.valor + d.estructura.largoSalida.valor
  const xInicio = -largoTotal / 2
  const xConvergente = xInicio + d.estructura.largoEntrada.valor
  const xGarganta = xConvergente + largoConvergente
  const xDivergente = xGarganta + d.garganta.largo.valor
  const xSalida = xDivergente + d.divergente.largo.valor
  return {
    largoTotal,
    xInicio,
    xConvergente,
    xGarganta,
    xDivergente,
    xSalida,
    xFin: xSalida + d.estructura.largoSalida.valor,
    xMedicion: xGarganta - d.convergente.distanciaMedicion.valor,
    anchoEntrada: wEntrada,
    anchoGarganta: wGarganta,
    anchoSalida: d.divergente.anchoSalida.valor,
    semiancho: Math.max(wEntrada, d.divergente.anchoSalida.valor) / 2 + d.estructura.espesorMuro.valor,
  }
}
