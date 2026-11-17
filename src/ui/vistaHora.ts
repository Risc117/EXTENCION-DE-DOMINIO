import { HORAS_POR_DIA } from '../nucleo/constantes'
import { CIFRAS_RELOJ, MINUTOS_POR_HORA, TRAMOS_FRANJA_DIA } from '../nucleo/constantesAmbiente'
import { TEXTO_HORA as T } from '../nucleo/textosAmbiente'
import { luzDelDia, lucesEncendidas, posicionSol } from '../nucleo/solar'

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

/** Cuánta luz de día (0 = noche, 1 = pleno día) hay en cada tramo del día, de las 00:00 a las 24:00, para ese lugar y fecha. */
export function luzPorTramo(latitud: number, mes: number, dia: number, tramos = TRAMOS_FRANJA_DIA): number[] {
  return Array.from({ length: tramos + 1 }, (_, n) => luzDelDia(posicionSol(latitud, mes, dia, (n * HORAS_POR_DIA) / tramos).elevacion).dia)
}

/** La franja de día y noche como degradado de CSS (del color del cielo de noche al de día), para pintarla bajo el deslizador de la hora. */
export function franjaDelDia(luz: number[]): string {
  const ultimo = Math.max(1, luz.length - 1)
  const paradas = luz.map((l, n) => `color-mix(in srgb, var(--color-cielo-dia) ${Math.round(l * 100)}%, var(--color-cielo-noche)) ${((n * 100) / ultimo).toFixed(1)}%`)
  return `linear-gradient(90deg, ${paradas.join(', ')})`
}
