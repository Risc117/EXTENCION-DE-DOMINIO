import type { DatosSeguridad } from '../comun/datosSeguridad'
import type { Pieza, PiezaCilindro } from '../comun/tipos'
import type { DatosDesinfeccion } from './esquema'

const COLOR_PISO = '--color-bomba-marcha'
const COLOR_TUBO = '--color-baranda'
/** Espesor (m) del plato, de la base y de la taza, y radio del cabezal y del poste de la ducha. */
const ESPESOR_BASE = 0.05
const ALTO_CABEZAL = 0.06
const RADIO_CABEZAL = 0.15
const RADIO_TUBO = 0.04
const RADIO_BASE_LAVAOJOS = 0.25

/**
 * Ducha de emergencia y lavaojos junto a la caseta de cloración (los nombra el plano, sin medidas): afuera del muro este, a la distancia y con las medidas de
 * datos/seguridad.json (de ejemplo). Origen: el de la caseta (centro, y = 0 en el piso).
 */
export function construirEmergencia(d: DatosDesinfeccion, e: DatosSeguridad['emergencia']): Pieza[] {
  const x = d.caseta.largo.valor / 2 + e.separacionMuro.valor
  const [zDucha, zLavaojos] = [-e.separacionEntre.valor / 2, e.separacionEntre.valor / 2]
  const cilindro = (id: string, color: string, z: number, y: number, radio: number, alto: number): PiezaCilindro => ({ id, forma: 'cilindro', color, pos: [x, y, z], radio, alto })
  return [
    cilindro('ducha-plato', COLOR_PISO, zDucha, ESPESOR_BASE / 2, e.radioPlato.valor, ESPESOR_BASE),
    cilindro('ducha-poste', COLOR_TUBO, zDucha, e.alturaDucha.valor / 2, RADIO_TUBO, e.alturaDucha.valor),
    cilindro('ducha-cabezal', COLOR_TUBO, zDucha, e.alturaDucha.valor, RADIO_CABEZAL, ALTO_CABEZAL),
    cilindro('lavaojos-base', COLOR_PISO, zLavaojos, ESPESOR_BASE / 2, RADIO_BASE_LAVAOJOS, ESPESOR_BASE),
    cilindro('lavaojos-pedestal', COLOR_TUBO, zLavaojos, e.alturaLavaojos.valor / 2, RADIO_TUBO, e.alturaLavaojos.valor),
    cilindro('lavaojos-taza', COLOR_PISO, zLavaojos, e.alturaLavaojos.valor, e.radioLavaojos.valor, ESPESOR_BASE),
  ]
}
