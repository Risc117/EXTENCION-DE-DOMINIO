import { z } from 'zod'

const medida = z.object({
  valor: z.number().positive(),
  unidad: z.enum(['m', 'u']),
  fuente: z.string().min(1),
  demo: z.boolean().optional(),
})

const tubo = z.object({ diametro: medida, altura: medida })

export const esquemaHomogeneizador = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  demo: z.boolean().optional(),
  tanque: z.object({
    largo: medida,
    ancho: medida,
    profundidad: medida,
    espesorMuro: medida,
  }),
  ingreso: tubo,
  salida: tubo,
  difusores: z.object({
    cantidad: medida.refine((m) => Number.isInteger(m.valor), 'La cantidad debe ser un número entero'),
    diametro: medida,
    altura: medida,
  }),
})

export type DatosHomogeneizador = z.infer<typeof esquemaHomogeneizador>
