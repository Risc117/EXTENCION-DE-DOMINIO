import { z } from 'zod'

const base = { fuente: z.string().min(1), demo: z.boolean().optional() }
const medida = z.object({ valor: z.number().finite(), unidad: z.literal('m'), ...base })
const medidaPositiva = z.object({ valor: z.number().positive(), unidad: z.literal('m'), ...base })
const punto = z.tuple([z.number().finite(), z.number().finite()])

const malla = z
  .object({
    ...base,
    paso: z.number().positive(),
    columnas: z.number().int().min(2),
    filas: z.number().int().min(2),
    /** Esquina suroeste (m locales). */
    x0: z.number().finite(),
    y0: z.number().finite(),
    /** Altura de cada nodo sobre `cotaBase` (m), de oeste a este y de sur a norte. */
    alturas: z.array(z.number().finite()),
  })
  .refine((m) => m.alturas.length === m.columnas * m.filas, 'La malla no tiene columnas × filas alturas')

const curva = z.object({
  cota: z.number().finite(),
  tipo: z.enum(['menor', 'intermedia', 'mayor']),
  puntos: z.array(punto).min(2),
})

const muro = z.object({
  ...base,
  espesor: medidaPositiva,
  altura: medidaPositiva,
  /** Cara exterior del muro (m locales), de un extremo al otro. */
  trazo: z.array(punto).min(2),
})

export const esquemaTerreno = z.object({
  fuente: z.string().min(1),
  /** Punto UTM que es el (0, 0) local; el mismo para planta.json y terreno.json. */
  origenUtm: z.object({ este: z.number(), norte: z.number(), zona: z.string().min(1), fuente: z.string().min(1) }),
  cotaBase: medida,
  malla,
  curvas: z.array(curva).min(1),
  muro,
})

export type DatosTerreno = z.infer<typeof esquemaTerreno>
export type MallaTerreno = DatosTerreno['malla']
export type CurvaTerreno = DatosTerreno['curvas'][number]

/** Hay datos de ejemplo en el terreno (hoy: la altura del muro). */
export const terrenoEsDemo = (t: DatosTerreno): boolean => t.muro.altura.demo === true || t.muro.espesor.demo === true
