import { HORAS_POR_DIA, LITROS_POR_M3, SEGUNDOS_POR_HORA } from '../nucleo/constantes'
import type { Hidrograma } from './hidrograma'

/**
 * Volumen requerido (m³) del día: diferencia entre el máximo y el mínimo del volumen acumulado
 * cuando entra el hidrograma y sale el promedio del día.
 */
export function volumenRequerido(h: Hidrograma, dia: number): number {
  const salida = h.promedio(dia)
  let acumulado = 0
  let min = 0
  let max = 0
  for (let hora = 0; hora < HORAS_POR_DIA; hora += h.pasoHoras) {
    acumulado += ((h.caudalEntrada(dia, hora) - salida) * h.pasoHoras * SEGUNDOS_POR_HORA) / LITROS_POR_M3
    min = Math.min(min, acumulado)
    max = Math.max(max, acumulado)
  }
  return max - min
}
