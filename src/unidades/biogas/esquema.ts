import { z } from 'zod'
import { positivo } from '../comun/medidas'

const metros = positivo('m')
const punto = z.object({ x: z.number().finite(), y: z.number().finite() })

export const esquemaBiogas = z.object({
  id: z.string().min(1),
  fuente: z.string().min(1),
  demo: z.boolean(),
  antorcha: z.object({
    nombre: z.string().min(1),
    centro: punto,
    fuentePosicion: z.string().min(1),
    radioChimenea: metros,
    alturaChimenea: metros,
    recinto: z.object({ poligono: z.array(punto).min(3), fuente: z.string().min(1), altura: metros }),
    radioSeguridad: metros,
    llama: z.object({ alturaMaxima: metros }),
  }),
  linea: z.object({
    nombre: z.string().min(1),
    trazado: z.array(punto).min(2),
    fuenteTrazado: z.string().min(1),
    diametro: metros,
    alturaSobreTerreno: metros,
  }),
})

export type DatosBiogas = z.infer<typeof esquemaBiogas>
