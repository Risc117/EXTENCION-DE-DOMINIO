import { z } from 'zod'
import crudo from '../../../datos/seguridad.json'
import { positivo } from './medidas'

const fuente = z.string().min(1)
const metros = z.object({ valor: z.number().positive(), unidad: z.literal('m'), fuente, demo: z.boolean() })

/** Seguridad de la planta (datos/seguridad.json): vereda y baranda del RAFA, y ducha de emergencia y lavaojos de la caseta de cloración. */
export const esquemaSeguridad = z.object({
  id: z.string().min(1),
  fuente,
  demo: z.boolean(),
  rafa: z.object({ largoTotal: metros, anchoTotal: metros, espesorVereda: positivo('m'), alturaBaranda: positivo('m'), separacionPostes: positivo('m'), grosor: positivo('m') }),
  emergencia: z.object({ separacionMuro: metros, separacionEntre: metros, alturaDucha: metros, radioPlato: metros, alturaLavaojos: metros, radioLavaojos: metros }),
})

export type DatosSeguridad = z.infer<typeof esquemaSeguridad>

/** Datos de seguridad ya validados. */
export const seguridad = esquemaSeguridad.parse(crudo)
