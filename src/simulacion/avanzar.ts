import { HORAS_POR_DIA, PASO_MAXIMO_SIMULACION, SEGUNDOS_POR_HORA } from '../nucleo/constantes'
import type { Medidas, ModoSalida, ParametrosTanque } from '../estado/simulacion'
import { pasoBalance } from './balance'
import type { Hidrograma } from './hidrograma'
import { caudalSalida } from './salida'

export interface Condiciones {
  dia: number
  modo: ModoSalida
  ajuste: number | null
}

export interface Instante {
  hora: number
  volumen: number
}

/** Avanza la simulación `dtSeg` segundos simulados, en pasos cortos para que la cuenta sea estable. */
export function avanzar(h: Hidrograma, tanque: ParametrosTanque, c: Condiciones, ini: Instante, dtSeg: number): Medidas {
  const promedio = h.promedio(c.dia)
  let { hora, volumen } = ini
  let restante = dtSeg
  let caudalSalidaReal = 0
  let caudalRebose = 0
  while (restante > 0) {
    const dt = Math.min(restante, PASO_MAXIMO_SIMULACION)
    const entrada = h.caudalEntrada(c.dia, hora)
    const deseado = caudalSalida(c.modo, volumen / tanque.area, promedio, c.ajuste, tanque)
    const r = pasoBalance(volumen, entrada, deseado, dt, tanque)
    volumen = r.volumen
    caudalSalidaReal = r.caudalSalida
    caudalRebose = r.caudalRebose
    hora = (hora + dt / SEGUNDOS_POR_HORA) % HORAS_POR_DIA
    restante -= dt
  }
  return {
    hora,
    volumen,
    nivel: volumen / tanque.area,
    caudalEntrada: h.caudalEntrada(c.dia, hora),
    caudalSalida: caudalSalidaReal,
    caudalRebose,
  }
}
