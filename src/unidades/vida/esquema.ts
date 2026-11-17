import { z } from 'zod'
import { positivo } from '../comun/medidas'

const fuente = z.string().min(1)
const punto = z.object({ x: z.number().finite(), y: z.number().finite() })
const puntoConFuente = punto.extend({ fuente, demo: z.boolean() })
const porCalidad = z.object({ alta: z.number().int().min(0), baja: z.number().int().min(0), fuente, demo: z.boolean() }).refine((c) => c.baja <= c.alta, 'En calidad baja no puede haber más que en alta')
const modelo = z.string().regex(/\.glb$/)

export const esquemaVida = z.object({
  id: z.string().min(1),
  fuente,
  demo: z.boolean(),
  pasto: z.object({
    franja: z.object({ puntos: z.array(punto).min(2), fuente }),
    ancho: positivo('m'),
    altura: positivo('m'),
    semilla: z.object({ valor: z.number().int().positive(), fuente }),
  }),
  cantidades: z.object({ pasto: porCalidad, perros: porCalidad, palomas: porCalidad, aves: porCalidad, moscas: porCalidad }),
  perro: z.object({ modelo, animacion: z.string().min(1), tamano: positivo('m'), velocidad: positivo('m/s'), ruta: z.literal('franja') }),
  paloma: z.object({ modelo, animacion: z.string().min(1), tamano: positivo('m'), velocidad: positivo('m/s'), radio: positivo('m'), lecho: z.string().min(1) }),
  ave: z.object({ modelo, tamano: positivo('m'), velocidad: positivo('m/s'), radio: positivo('m'), altura: positivo('m'), centro: puntoConFuente }),
  garza: z.object({ modelo, tamano: positivo('m'), posicion: puntoConFuente, rumbo: z.object({ valor: z.number(), unidad: z.literal('grados'), fuente, demo: z.boolean() }) }),
  mosca: z.object({ modelo, tamano: positivo('m'), radio: positivo('m'), altura: positivo('m'), velocidad: positivo('m/s'), lecho: z.string().min(1) }),
})

export type DatosVida = z.infer<typeof esquemaVida>

export const esquemaCreditos = z.object({
  id: z.string().min(1),
  fuente,
  modelos: z.array(z.object({ archivo: z.string().regex(/^public\/modelos\/.+\.glb$/), nombre: fuente, autor: fuente, licencia: z.string().regex(/CC0/), url: z.string().url(), obtenido: z.string(), fuente })).min(1),
})
