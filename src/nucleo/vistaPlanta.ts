import { DISTANCIA_INICIAL, ELEVACION_MAXIMA } from './constantesCamara'
import { MARGEN_VISTA_PLANTA } from './constantesVistaPlanta'

export interface PosicionCamara {
  acimut: number
  elevacion: number
  distancia: number
}

/** Cámara de la vista de planta: desde arriba (casi vertical), con el norte hacia arriba de la pantalla (acimut 0), como el plano. */
export const camaraDePlanta = (): PosicionCamara => ({ acimut: 0, elevacion: ELEVACION_MAXIMA, distancia: DISTANCIA_INICIAL })

/** true si la cámara está en la vista de planta (con un margen, porque la cámara se acerca a su destino con suavidad). */
export function esVistaPlanta(c: PosicionCamara): boolean {
  const vuelta = 2 * Math.PI
  const acimut = ((c.acimut % vuelta) + vuelta) % vuelta
  return Math.abs(c.elevacion - ELEVACION_MAXIMA) < MARGEN_VISTA_PLANTA && Math.min(acimut, vuelta - acimut) < MARGEN_VISTA_PLANTA
}
