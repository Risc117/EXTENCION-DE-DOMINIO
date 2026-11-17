import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import { disponer } from './disposicion'
import type { DatosRafa } from './esquema'

/** x del centro de la caja de distribución (m): a la mitad del largo, `desplazamientoSur` al sur (−x). */
export const xCajaDistribucion = (d: DatosRafa): number => -d.distribucion.caja.desplazamientoSur.valor

/** Extremo exterior del tubo afluente: punto [x, z] (m, locales) a 1.5 m de la cara exterior del muro del lado oeste (−z). */
export function puertoAfluente(d: DatosRafa): [number, number] {
  return [xCajaDistribucion(d), -(disponer(d).semiAncho + PROLONGACION_TUBO)]
}
