import { z } from 'zod'
import calidadCruda from '../../datos/calidad.json'
import crudo from '../../datos/drenaje.json'
import escala from '../../datos/escalaCaudal.json'
import lodosCrudo from '../../datos/lodosBiogas.json'
import { esquemaCalidad } from './calidadEsquema'
import { produccionLodosBiogas } from './lodosBiogas'
import { esquemaLodosBiogas } from './lodosBiogasEsquema'

const fuente = z.string().min(1)
const medida = <U extends string>(unidad: U) => z.object({ valor: z.number().positive(), unidad: z.literal(unidad), fuente, demo: z.boolean() })

/** Retorno del drenaje de los lechos de secado al cárcamo (datos/drenaje.json): impulsión con bomba, todo de ejemplo y por confirmar. */
export const esquemaDrenaje = z.object({
  id: z.string().min(1),
  fuente,
  demo: z.boolean(),
  bomba: z.object({ alturaDinamica: medida('m'), potencia: medida('kW') }),
  diametroImpulsion: medida('m'),
  diametroDrenaje: medida('m'),
})

export const drenaje = esquemaDrenaje.parse(crudo)

const LITROS_POR_M3 = 1000
const SEGUNDOS_POR_DIA = 86400

/**
 * Caudal (L/s) del drenaje de los lechos: el agua que pierde el lodo al secarse (lodo húmedo menos lodo deshidratado, m³/d, con el caudal de diseño),
 * sin contar la evaporación. Es una cantidad fija y chica: se suma al caudal que entra al cárcamo. Dato de ejemplo.
 */
export function caudalDrenaje(): number {
  const p = produccionLodosBiogas(esquemaLodosBiogas.parse(lodosCrudo), esquemaCalidad.parse(calidadCruda).afluente.dqo.valor, escala.caudalPromedio.valor)
  return ((p.lodoHumedoM3dia - p.lodoDeshidratadoM3dia) * LITROS_POR_M3) / SEGUNDOS_POR_DIA
}
