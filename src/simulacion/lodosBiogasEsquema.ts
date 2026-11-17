import { z } from 'zod'

const fuente = z.string().min(1)
const medida = <U extends string>(unidad: U) => z.object({ valor: z.number().positive(), unidad: z.literal(unidad), fuente, demo: z.boolean().optional() })

export const esquemaLodosBiogas = z.object({
  id: z.string().min(1),
  fuente,
  demo: z.boolean(),
  biogas: z.object({ produccionEspecifica: medida('m3/kgDQO') }),
  lodo: z.object({
    rendimiento: medida('kgSST/kgDQO'),
    densidadHumedo: medida('kg/m3'),
    /** Concentración de sólidos del lodo húmedo (%, mayor que 0 y hasta 100). */
    concentracionHumedo: medida('%').refine((m) => m.valor <= 100, 'Más de 100 %'),
    densidadDeshidratado: medida('kg/m3'),
    concentracionDeshidratado: medida('%').refine((m) => m.valor <= 100, 'Más de 100 %'),
  }),
  lechos: z.object({ area: medida('m2'), ciclo: medida('dias') }),
  /** Por qué el volumen de lodo se recalcula (error de factor 100 en la hoja). */
  correccionVolumen: z.object({ fuente, demo: z.boolean() }),
  /** Valores de la hoja de cálculo, para comprobar que la lógica los reproduce. */
  referenciasHoja: z.object({ dqoAplicada: medida('kgDQO/d'), lodo: medida('kgSST/d'), biogas: medida('m3/h'), caudalDiseno: medida('L/s') }),
})

export type DatosLodosBiogas = z.infer<typeof esquemaLodosBiogas>
