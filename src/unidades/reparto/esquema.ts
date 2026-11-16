import { z } from 'zod'
import { positivo } from '../comun/medidas'

const metros = positivo('m')

export const esquemaReparto = z
  .object({
    id: z.string().min(1),
    nombre: z.string().min(1),
    demo: z.boolean().optional(),
    caja: z.object({ largo: metros, ancho: metros, alto: metros, espesorMuro: metros, nivelAgua: metros }),
  })
  .refine((d) => d.caja.nivelAgua.valor < d.caja.alto.valor - d.caja.espesorMuro.valor, 'El agua debe quedar bajo el borde de la cámara')
  .refine((d) => d.caja.largo.valor > 2 * d.caja.espesorMuro.valor && d.caja.ancho.valor > 2 * d.caja.espesorMuro.valor, 'Los muros no caben en la cámara')

export type DatosReparto = z.infer<typeof esquemaReparto>

/** Altura total (m) de la cámara de reparto. */
export const alturaTotal = (d: DatosReparto): number => d.caja.alto.valor
