import { z } from 'zod'
import { positivo } from '../comun/medidas'

const metros = positivo('m')

export const esquemaDesarenador = z
  .object({
    id: z.string().min(1),
    nombre: z.string().min(1),
    demo: z.boolean().optional(),
    canal: z.object({
      numero: positivo('u').refine((n) => Number.isInteger(n.valor), 'El número de canales debe ser entero'),
      ancho: metros,
      anchoHoja: metros,
      espesorMuroCentral: metros,
      largo: metros,
      alturaMuro: metros,
      espesorMuro: metros,
      espesorLosa: metros,
    }),
    transicion: z.object({ largo: metros }),
    salida: z.object({ largo: metros }),
    tolva: z.object({ altura: metros }),
    vertedero: z.object({ ancho: metros, alturaMinima: metros, coeficiente: positivo('adim') }),
  })
  .refine((d) => d.tolva.altura.valor + d.vertedero.alturaMinima.valor < d.canal.alturaMuro.valor, 'La tolva y el vertedero deben caber bajo el muro')
  .refine((d) => d.vertedero.ancho.valor <= d.canal.ancho.valor, 'El vertedero no puede ser más ancho que el canal')

export type DatosDesarenador = z.infer<typeof esquemaDesarenador>
