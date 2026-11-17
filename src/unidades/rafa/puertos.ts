import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import { disponer } from './disposicion'
import type { DatosRafa } from './esquema'

/** Extremo exterior del tubo afluente: punto [x, z] (m, locales) sobre el eje A-A (x = 0, la mitad del largo), a 1.5 m de la caja de distribución, que va pegada por fuera al lado oeste (−z). */
export function puertoAfluente(d: DatosRafa): [number, number] {
  return [0, -(disponer(d).semiAncho + d.distribucion.caja.ancho.valor + PROLONGACION_TUBO)]
}

/**
 * Centro del muro del extremo corto norte (el más cercano a BZ-5): punto [x, z] (m, locales) por donde el plano general (DXF) saca el efluente.
 * El plano de detalle lo pone en la cámara del lado largo este: la diferencia queda POR CONFIRMAR (T16.4.7).
 */
export function puertoEfluenteExtremo(d: DatosRafa): [number, number] {
  return [disponer(d).semiLargo, 0]
}
