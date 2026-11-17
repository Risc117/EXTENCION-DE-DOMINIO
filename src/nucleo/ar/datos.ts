import { z } from 'zod'
import crudo from '../../../datos/ar.json'

const fuente = z.string().min(1)
const metros = z.object({ valor: z.number().positive(), unidad: z.literal('m'), fuente, demo: z.boolean() })

/** Medidas de la AR (datos/ar.json): todas de ejemplo. */
export const esquemaAR = z
  .object({ id: z.string().min(1), fuente, demo: z.boolean(), anchoMaqueta: metros, planoCercano: metros, planoLejano: metros })
  .refine((d) => d.planoCercano.valor < d.planoLejano.valor, 'El plano cercano debe ser menor que el lejano')

export type DatosAR = z.infer<typeof esquemaAR>

/** Datos de AR ya validados. */
export const datosAR = esquemaAR.parse(crudo)
