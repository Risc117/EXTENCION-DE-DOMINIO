import { z } from 'zod'

const fuente = z.string().min(1)
const demo = z.boolean().optional()
const concentracion = (unidad: string) => z.object({ valor: z.number().positive(), unidad: z.literal(unidad), fuente, demo })
const fraccion = z.object({ valor: z.number().min(0).max(1), unidad: z.literal('fraccion'), fuente, demo })

const porParametro = <T extends z.ZodType>(t: (u: string) => T, unidades: Record<'dbo' | 'dqo' | 'sst' | 'cf', string>) =>
  z.object({ dbo: t(unidades.dbo), dqo: t(unidades.dqo), sst: t(unidades.sst), cf: t(unidades.cf) })

const unidades = { dbo: 'mg/L', dqo: 'mg/L', sst: 'mg/L', cf: 'NMP/100 mL' }

export const esquemaCalidad = z
  .object({
    id: z.string().min(1),
    fuente,
    demo: z.boolean(),
    /** Cómo se estimó lo que no está en las hojas. */
    metodo: z.string().min(20),
    afluente: porParametro(concentracion, unidades),
    etapas: z
      .array(
        z.object({
          id: z.string().min(1),
          /** Fracción removida de cada parámetro en la unidad (0 = nada, 1 = todo). */
          remocion: z.object({ dbo: fraccion, dqo: fraccion, sst: fraccion, cf: fraccion }),
        }),
      )
      .min(1),
    limites: z.object({
      /** Límites máximos permisibles de la descarga. */
      descarga: porParametro(concentracion, unidades),
      /** ECA del cuerpo receptor, de referencia (no incluye SST). */
      eca: z.object({ dbo: concentracion('mg/L'), dqo: concentracion('mg/L'), cf: concentracion('NMP/100 mL') }),
    }),
  })
  .refine((d) => new Set(d.etapas.map((e) => e.id)).size === d.etapas.length, 'Hay etapas repetidas')

export type DatosCalidad = z.infer<typeof esquemaCalidad>

/** Etapas del JSON que no son una unidad de la línea de agua, y unidades de la línea que no tienen etapa. */
export function etapasSinUnidad(d: DatosCalidad, idsLinea: string[]): { sinEtapa: string[]; sobran: string[] } {
  const etapas = d.etapas.map((e) => e.id)
  return { sinEtapa: idsLinea.filter((id) => !etapas.includes(id)), sobran: etapas.filter((id) => !idsLinea.includes(id)) }
}
