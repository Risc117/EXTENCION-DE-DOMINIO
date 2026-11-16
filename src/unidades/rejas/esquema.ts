import { z } from 'zod'
import { medida, noNegativo, positivo, signo } from '../comun/medidas'

const metros = positivo('m')

export const esquemaRejas = z
  .object({
    id: z.string().min(1),
    nombre: z.string().min(1),
    demo: z.boolean().optional(),
    canal: z.object({ ancho: metros, alturaMuro: metros, espesorMuro: metros, espesorLosa: metros, largoSalida: metros }),
    recepcion: z.object({ largo: metros, ancho: metros }),
    transicion: z.object({ largo: metros }),
    reja: z.object({
      espesorBarra: metros,
      profundidadBarra: metros,
      separacion: metros,
      angulo: positivo('grados'),
      altura: metros,
      largo: metros,
      numeroBarras: medida.refine((m) => m.valor >= 1, 'Debe haber al menos una barra'),
    }),
    bandeja: z.object({ largo: metros, hundimiento: metros }),
    hidraulica: z.object({ velocidadCanal: positivo('m/s') }),
    bypass: z.object({ largoVertedero: metros, anchoCanal: metros, alturaCresta: noNegativo('m'), lado: signo }),
  })
  .refine((d) => d.reja.angulo.valor < 90, 'El ángulo de la reja debe ser menor de 90°')
  .refine((d) => d.reja.altura.valor <= d.canal.alturaMuro.valor, 'La reja no puede ser más alta que el muro del canal')
  .refine((d) => d.reja.altura.valor <= d.reja.largo.valor, 'La altura de la reja no puede superar su largo')
  .refine((d) => d.bypass.alturaCresta.valor <= d.canal.alturaMuro.valor, 'La cresta del by-pass no puede pasar el muro')

export type DatosRejas = z.infer<typeof esquemaRejas>
