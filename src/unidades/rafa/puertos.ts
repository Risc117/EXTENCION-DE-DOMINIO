import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import { disponer } from './disposicion'
import type { DatosRafa } from './esquema'

/** Extremo exterior del tubo afluente: punto [x, z] (m, locales) sobre el eje A-A (x = 0, la mitad del largo), a 1.5 m de la caja de distribución, que va pegada por fuera al lado oeste (−z). */
export function puertoAfluente(d: DatosRafa): [number, number] {
  return [0, -(disponer(d).semiAncho + d.distribucion.caja.ancho.valor + PROLONGACION_TUBO)]
}
