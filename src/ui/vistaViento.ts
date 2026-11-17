import { nombreDireccion } from '../nucleo/viento'
import { GRADOS_MEDIA_VUELTA } from '../nucleo/constantesViento'

export interface VistaViento {
  /** Giro (° horario desde arriba) de la flecha, que apunta hacia donde sopla el viento. */
  giro: number
  velocidad: string
  /** Punto de la rosa de los vientos de donde viene. */
  desde: string
  grados: string
}

/** Lo que dice el indicador de viento: la flecha apunta hacia donde sopla (opuesto a de donde viene). */
export function vistaViento(velocidad: number, desde: number): VistaViento {
  return { giro: (desde + GRADOS_MEDIA_VUELTA) % (2 * GRADOS_MEDIA_VUELTA), velocidad: velocidad.toFixed(1), desde: nombreDireccion(desde), grados: `${Math.round(desde)}°` }
}
