import { z } from 'zod'
import { positivo } from '../comun/medidas'

const fuente = z.string().min(1)
const angulo = (min: number, max: number) => z.object({ valor: z.number().min(min).max(max), unidad: z.literal('grados'), fuente, demo: z.boolean().optional() })
const punto = z.object({ x: z.number().finite(), y: z.number().finite() })

export const esquemaAmbiente = z.object({
  id: z.string().min(1),
  fuente,
  demo: z.boolean(),
  ubicacion: z.object({ latitud: angulo(-90, 90), longitud: angulo(-180, 180) }),
  fecha: z.object({ mes: z.number().int().min(1).max(12), dia: z.number().int().min(1).max(31), fuente, demo: z.boolean() }),
  /** Giro (°) del norte respecto del eje −z de la escena; positivo hacia el este. */
  giroNorte: angulo(-180, 180),
  luminarias: z.object({
    puntos: z.array(punto).min(1),
    fuentePuntos: fuente,
    alturaPoste: positivo('m'),
    radioPoste: positivo('m'),
    radioLuz: positivo('m'),
  }),
})

export type DatosAmbiente = z.infer<typeof esquemaAmbiente>
