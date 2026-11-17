import { AMBIENTE_DIA, AMBIENTE_NOCHE, CREPUSCULO, DIAS_ANIO, DIAS_POR_MES, GRADOS_POR_HORA, HORA_MEDIODIA, INCLINACION_MAXIMA, UMBRAL_LUCES } from './constantesSolar'

const RAD = Math.PI / 180

/** Posición del sol: altura sobre el horizonte y acimut (° desde el norte, hacia el este). */
export interface Sol {
  elevacion: number
  acimut: number
}

/** Día del año (1 a 365) de un mes y un día. */
export function diaDelAnio(mes: number, dia: number): number {
  return DIAS_POR_MES.slice(0, mes - 1).reduce((s, d) => s + d, 0) + dia
}

/**
 * Posición del sol para una latitud (° con signo, sur negativa), un mes y día, y una hora solar (0 a 24).
 * Declinación de Cooper; el ángulo horario crece 15° por hora desde el mediodía solar.
 */
export function posicionSol(latitud: number, mes: number, dia: number, hora: number): Sol {
  const declinacion = INCLINACION_MAXIMA * Math.sin(((2 * Math.PI) / DIAS_ANIO) * (284 + diaDelAnio(mes, dia)))
  const [phi, delta, h] = [latitud * RAD, declinacion * RAD, (hora - HORA_MEDIODIA) * GRADOS_POR_HORA * RAD]
  const seno = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(h)
  const elevacion = Math.asin(seno)
  // Acimut desde el norte, horario: este por la mañana (hora < 12) y oeste por la tarde.
  const cos = (Math.sin(delta) - Math.sin(elevacion) * Math.sin(phi)) / (Math.cos(elevacion) * Math.cos(phi))
  const desdeNorte = Math.acos(Math.max(-1, Math.min(1, cos))) / RAD
  return { elevacion: elevacion / RAD, acimut: hora < HORA_MEDIODIA ? desdeNorte : 360 - desdeNorte }
}

/** Vector unitario hacia el sol en la escena: x este, y arriba, z sur (el norte es −z). */
export function direccionAlSol(s: Sol, giroNorte = 0): [number, number, number] {
  const [el, az] = [s.elevacion * RAD, (s.acimut + giroNorte) * RAD]
  return [Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)]
}

/** Cuánta luz hay: del sol y ambiente, y la mezcla día-noche del cielo (0 noche, 1 día) con un crepúsculo suave. */
export interface LuzDia {
  sol: number
  ambiente: number
  dia: number
  estrellas: number
}

const acotar = (v: number) => Math.max(0, Math.min(1, v))

export function luzDelDia(elevacion: number): LuzDia {
  const dia = acotar((elevacion + CREPUSCULO / 2) / CREPUSCULO)
  return {
    sol: acotar(Math.sin(elevacion * RAD)),
    ambiente: AMBIENTE_NOCHE + (AMBIENTE_DIA - AMBIENTE_NOCHE) * dia,
    dia,
    estrellas: 1 - dia,
  }
}

/** true si el sol está bajo el horizonte (con el umbral): se encienden las luces de la planta. */
export const lucesEncendidas = (elevacion: number): boolean => elevacion < UMBRAL_LUCES
