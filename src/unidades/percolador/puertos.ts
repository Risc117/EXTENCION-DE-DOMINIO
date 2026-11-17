import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import { disponer } from './disposicion'
import type { DatosPercolador } from './esquema'

/** Extremo exterior del tubo de entrada: punto [x, z] (m, locales: origen en la columna, x al este) a 1.5 m de la cara exterior del muro, por el oeste. */
export function puertoEntrada(d: DatosPercolador): { x: number; z: number } {
  return { x: -(disponer(d).radioExterior + PROLONGACION_TUBO), z: 0 }
}
