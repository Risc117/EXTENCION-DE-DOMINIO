import { z } from 'zod'
import crudo from '../../../datos/vr.json'

const fuente = z.string().min(1)
const medida = <U extends string>(unidad: U) => z.object({ valor: z.number().positive(), unidad: z.literal(unidad), fuente, demo: z.boolean() })

/** Medidas de la VR (datos/vr.json): todas de ejemplo; el punto de entrada se calcula en la escena con la vía indicada. */
export const esquemaVR = z.object({
  id: z.string().min(1),
  fuente,
  demo: z.boolean(),
  alturaOjos: medida('m'),
  separacionOjos: medida('m'),
  tiempoMirada: medida('s'),
  anguloSalir: medida('grados').refine((a) => a.valor < 90, 'El ángulo de salida debe ser menor de 90°'),
  distanciaMaxima: medida('m'),
  campoVision: medida('grados').refine((a) => a.valor < 180, 'El campo de visión debe ser menor de 180°'),
  inicio: z.object({ via: z.string().min(1), indice: z.number().int().min(0), haciaIndice: z.number().int().min(1), fuente }),
})

export type DatosVR = z.infer<typeof esquemaVR>

/** Datos de VR ya validados. */
export const datosVR = esquemaVR.parse(crudo)
