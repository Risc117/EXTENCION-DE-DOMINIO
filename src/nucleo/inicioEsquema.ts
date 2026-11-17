import { z } from 'zod'

const fuente = z.string().min(1)
const medida = <U extends string>(unidad: U) => z.object({ valor: z.number().positive(), unidad: z.literal(unidad), fuente, demo: z.boolean() })
const caudal = medida('L/s').extend({ nombre: z.string().min(1), descripcion: z.string().min(1) })

/** Datos de la pantalla de inicio (datos/inicio.json): de la memoria descriptiva, con su fuente. */
export const esquemaInicio = z
  .object({
    id: z.string().min(1),
    fuente,
    demo: z.boolean(),
    titulo: z.string().min(1),
    queEs: z.string().min(1),
    ubicacion: z.object({ texto: z.string().min(1), altitud: medida('m s. n. m.'), cuerpoReceptor: z.string().min(1), notas: z.array(z.string()), fuente }),
    poblacion: z.object({ base: medida('hab.'), proyectada: medida('hab.').extend({ anio: z.number().int() }), notas: z.array(z.string()) }),
    caudales: z.object({ qp: caudal, qmd: caudal, qmh: caudal, qmin: caudal }),
    tren: z.array(z.object({ id: z.string().min(1), nombre: z.string().min(1), detalle: z.string().min(1).optional() })).min(1),
    fuenteTren: fuente,
  })
  .refine((d) => d.caudales.qmin.valor <= d.caudales.qp.valor && d.caudales.qp.valor <= d.caudales.qmd.valor && d.caudales.qmd.valor <= d.caudales.qmh.valor, 'Los caudales deben cumplir Qmin ≤ Qp ≤ Qmd ≤ Qmh')
  .refine((d) => d.poblacion.proyectada.valor >= d.poblacion.base.valor, 'La población proyectada no puede ser menor que la base')

export type DatosInicio = z.infer<typeof esquemaInicio>
