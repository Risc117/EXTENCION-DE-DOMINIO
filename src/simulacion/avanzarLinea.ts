import { HORAS_POR_DIA, PASO_MAXIMO_SIMULACION, SEGUNDOS_POR_HORA } from '../nucleo/constantes'
import type { Hidrograma } from './hidrograma'
import type { Linea, ResultadoLinea } from './linea'

/**
 * Avanza la línea de agua `dtSeg` segundos simulados desde la hora `hora` del día `dia`, en pasos cortos como el reloj principal,
 * con el caudal de entrada del hidrograma en cada hora más `retorno` (L/s: el drenaje de los lechos que vuelve al cárcamo). Devuelve lo que pasó en el último paso.
 */
export function avanzarLinea(linea: Linea, h: Hidrograma, dia: number, hora: number, dtSeg: number, retorno = 0): ResultadoLinea {
  const promedio = h.promedio(dia)
  let restante = dtSeg
  let horaActual = hora
  let ultimo: ResultadoLinea | null = null
  while (restante > 0) {
    const dt = Math.min(restante, PASO_MAXIMO_SIMULACION)
    ultimo = linea.paso(h.caudalEntrada(dia, horaActual) + retorno, dt, promedio)
    horaActual = (horaActual + dt / SEGUNDOS_POR_HORA) % HORAS_POR_DIA
    restante -= dt
  }
  return ultimo ?? linea.paso(h.caudalEntrada(dia, horaActual) + retorno, 0, promedio)
}
