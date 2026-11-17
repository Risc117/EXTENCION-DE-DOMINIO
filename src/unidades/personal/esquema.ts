import { z } from 'zod'
import { positivo } from '../comun/medidas'

const fuente = z.string().min(1)
const modelo = z.string().regex(/\.glb$/)
const porCalidad = z.object({ alta: z.number().int().min(0), baja: z.number().int().min(0), fuente, demo: z.boolean() }).refine((c) => c.baja <= c.alta, 'En calidad baja no puede haber más que en alta')
/** Un tramo de ruta: una parte del eje de una vía (índices de sus vértices, el último por omisión) o el centro de una superficie. */
const tramo = z.union([z.object({ via: z.string().min(1), desde: z.number().int().min(0).optional(), hasta: z.number().int().min(0).optional() }), z.object({ superficie: z.string().min(1) })])
const tramos = z.array(tramo).min(1)

export const esquemaRutas = z.object({
  id: z.string().min(1),
  fuente,
  demo: z.boolean(),
  tecnico: z.object({ modelo, tamano: positivo('m'), animacionCaminar: z.string().min(1), animacionParado: z.string().min(1), animacionVigilante: z.string().min(1) }),
  tecnicos: z
    .array(z.object({ id: z.string().min(1), nombre: z.string().min(1), tramos, desplazamiento: positivo('m'), velocidad: positivo('m/s'), paradas: z.array(z.object({ unidad: z.string().min(1), pausa: positivo('s') })).min(1) }))
    .min(1),
  vehiculos: z.array(z.object({ id: z.string().min(1), modelo, tamano: positivo('m'), velocidad: positivo('m/s'), espera: positivo('s'), pausaFinal: positivo('s'), tramos })).min(1),
  cantidades: z.object({ tecnicos: porCalidad, vehiculos: porCalidad }),
  vigilante: z.object({ posicion: z.object({ x: z.number().finite(), y: z.number().finite(), fuente, demo: z.boolean() }), rumbo: z.object({ valor: z.number(), unidad: z.literal('grados'), fuente, demo: z.boolean() }) }),
  barrera: z.object({ radioApertura: positivo('m'), anguloAbierta: positivo('grados'), rapidez: positivo('grados/s') }),
  faros: z.object({ brillo: positivo('adim') }),
})

export type DatosRutas = z.infer<typeof esquemaRutas>
export type RutaTecnico = DatosRutas['tecnicos'][number]
export type RutaVehiculo = DatosRutas['vehiculos'][number]
