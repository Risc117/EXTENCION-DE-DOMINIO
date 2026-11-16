import { z } from 'zod'

/** Un valor con su unidad y su fuente. `demo: true` = dato de ejemplo. */
export const medida = z.object({
  valor: z.number().positive(),
  unidad: z.enum(['m', 'u']),
  fuente: z.string().min(1),
  demo: z.boolean().optional(),
})
