import { z } from 'zod'
import crudo from '../../../datos/vegetacion.json'
import { positivo } from '../comun/medidas'

const fuente = z.string().min(1)
const porCalidad = z.object({ alta: z.number().int().min(0), baja: z.number().int().min(0), fuente, demo: z.boolean() }).refine((c) => c.baja <= c.alta, 'En calidad baja no puede haber más que en alta')

/** Vegetación de los alrededores (datos/vegetacion.json): todo de ejemplo. */
export const esquemaVegetacion = z.object({
  id: z.string().min(1),
  fuente,
  demo: z.boolean(),
  semilla: z.object({ valor: z.number().int().positive(), fuente }),
  alcance: positivo('m'),
  margenCerco: positivo('m'),
  margenRio: positivo('m'),
  margenCamino: positivo('m'),
  variacionEscala: z.object({ valor: z.object({ minima: z.number().positive(), maxima: z.number().positive() }).refine((v) => v.minima <= v.maxima), unidad: z.literal('adim'), fuente, demo: z.boolean() }),
  arboles: z.object({ cantidad: porCalidad, radioCopa: positivo('m'), alturaTotal: positivo('m'), radioTronco: positivo('m'), alturaTronco: positivo('m') }),
  arbustos: z.object({ cantidad: porCalidad, radio: positivo('m'), altura: positivo('m') }),
  pasto: z.object({ cantidad: porCalidad, altura: positivo('m'), radio: positivo('m') }),
})

/** Vegetación ya validada. */
export const vegetacion = esquemaVegetacion.parse(crudo)
export type DatosVegetacion = z.infer<typeof esquemaVegetacion>
