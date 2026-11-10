import { CD_SALIDA, GRAVEDAD, LITROS_POR_M3 } from '../nucleo/constantes'
import type { ModoSalida, ParametrosTanque } from '../estado/simulacion'

/** Salida por gravedad (L/s): Q = Cd·A·√(2·g·h), con h = nivel sobre el eje de la salida. */
export function caudalGravedad(nivel: number, tanque: ParametrosTanque): number {
  const h = nivel - tanque.alturaEjeSalida
  if (h <= 0) return 0
  const area = (Math.PI * tanque.diametroSalida ** 2) / 4
  return LITROS_POR_M3 * CD_SALIDA * area * Math.sqrt(2 * GRAVEDAD * h)
}

/** Caudal de salida deseado (L/s) según el modo. */
export function caudalSalida(
  modo: ModoSalida,
  nivel: number,
  promedioDia: number,
  ajuste: number | null,
  tanque: ParametrosTanque,
): number {
  if (modo === 'gravedad') return caudalGravedad(nivel, tanque)
  return ajuste ?? promedioDia
}
