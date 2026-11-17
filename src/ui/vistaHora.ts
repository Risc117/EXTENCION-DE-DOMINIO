import { HORAS_POR_DIA } from '../nucleo/constantes'
import { CIFRAS_RELOJ, MINUTOS_POR_HORA } from '../nucleo/constantesAmbiente'
import { TEXTO_HORA as T } from '../nucleo/textosAmbiente'
import { luzDelDia, lucesEncendidas } from '../nucleo/solar'

/** Hora en formato HH:MM. */
export function textoHora(hora: number): string {
  const total = Math.round(hora * MINUTOS_POR_HORA) % (HORAS_POR_DIA * MINUTOS_POR_HORA)
  return `${String(Math.floor(total / MINUTOS_POR_HORA)).padStart(CIFRAS_RELOJ, '0')}:${String(total % MINUTOS_POR_HORA).padStart(CIFRAS_RELOJ, '0')}`
}

export interface VistaHora {
  hora: string
  /** "Día", "Noche" o "Amanecer o atardecer". */
  momento: string
  altura: string
  luces: string
}

/** Lo que dice el panel de la hora: la hora, si es de día o de noche, la altura del sol y si las luces están encendidas. */
export function vistaHora(hora: number, elevacion: number): VistaHora {
  const { dia } = luzDelDia(elevacion)
  return {
    hora: textoHora(hora),
    momento: dia >= 1 ? T.dia : dia <= 0 ? T.noche : T.amanecer,
    altura: `${elevacion.toFixed(0)}°`,
    luces: lucesEncendidas(elevacion) ? T.encendidas : T.apagadas,
  }
}
