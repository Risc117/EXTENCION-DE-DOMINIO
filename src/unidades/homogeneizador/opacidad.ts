import { OPACIDAD_ZONA_MEZCLA } from '../../nucleo/constantes'
import type { TipoPieza } from './geometria'

/**
 * Opacidad de cada pieza. `opacidadMuros` es la de "Ver corte" de todas las unidades (undefined = opacos, ver useOpacidadCorte):
 * se aplica al muro y a la losa del techo; la zona de mezcla siempre es translúcida.
 */
export function opacidadPieza(tipo: TipoPieza, opacidadMuros: number | undefined): number | undefined {
  if (tipo === 'zona-mezcla') return OPACIDAD_ZONA_MEZCLA
  return tipo === 'muro' || tipo === 'losa-techo' ? opacidadMuros : undefined
}
