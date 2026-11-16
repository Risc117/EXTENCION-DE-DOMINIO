import { z } from 'zod'
import { positivo } from '../comun/medidas'

const metros = positivo('m')

export const esquemaParshall = z
  .object({
    id: z.string().min(1),
    nombre: z.string().min(1),
    demo: z.boolean().optional(),
    garganta: z.object({ ancho: metros, largo: metros, caida: metros }),
    convergente: z.object({ largoPared: metros, anchoEntrada: metros, distanciaMedicion: metros, alturaMuro: metros }),
    divergente: z.object({ largo: metros, anchoSalida: metros, subida: metros }),
    estructura: z.object({ alturaMuro: metros, espesorMuro: metros, espesorLosa: metros, largoEntrada: metros, largoSalida: metros }),
    hidraulica: z.object({ coeficiente: positivo('adim'), exponente: positivo('adim') }),
  })
  .refine((d) => d.convergente.anchoEntrada.valor > d.garganta.ancho.valor, 'La entrada debe ser más ancha que la garganta')
  .refine((d) => d.divergente.anchoSalida.valor > d.garganta.ancho.valor, 'La salida debe ser más ancha que la garganta')
  .refine((d) => d.convergente.largoPared.valor > (d.convergente.anchoEntrada.valor - d.garganta.ancho.valor) / 2, 'La pared convergente es demasiado corta')
  .refine((d) => d.estructura.alturaMuro.valor > d.garganta.caida.valor + d.convergente.alturaMuro.valor, 'El muro de la estructura debe pasar la canaleta (desnivel de la garganta más su profundidad)')

export type DatosParshall = z.infer<typeof esquemaParshall>
