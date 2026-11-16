import { z } from 'zod'

const base = { fuente: z.string().min(1), demo: z.boolean().optional() }

/** Número con unidad y fuente que puede ser negativo o cero (coordenadas, giro). */
const coordenada = <U extends string>(unidad: U) =>
  z.object({ valor: z.number().finite(), unidad: z.literal(unidad), ...base })

/** Medida positiva con unidad y fuente. */
const positiva = z.object({ valor: z.number().positive(), unidad: z.literal('m'), ...base })

/** Caja de ejemplo: el alto sale de las cotas de fondo y coronación. */
const marcador = z.object({ largo: positiva, ancho: positiva })

const unidadPlanta = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  /** Metros locales del plano general: x hacia el este, y hacia el norte. */
  x: coordenada('m'),
  y: coordenada('m'),
  /** Grados, en sentido antihorario visto desde arriba. */
  giro: coordenada('grados'),
  /** Cota del fondo (m s.n.m.). */
  cotaFondo: positiva,
  /** Cota de la parte más alta de la estructura (m s.n.m.). */
  cotaCoronacion: positiva,
  /** Cota (m s.n.m.) a la que se aplana el terreno alrededor de la unidad. */
  cotaSuperficie: positiva,
  /** Radio (m) del piso plano alrededor de la unidad; después viene la transición suave. */
  radioExplanada: positiva,
  /** Solo si la unidad aún no está hecha: tamaño de la caja que la representa. */
  marcador: marcador.optional(),
})

export const esquemaPlanta = z
  .object({ fuente: z.string().min(1), demo: z.boolean().optional(), unidades: z.array(unidadPlanta).min(1) })
  .refine((p) => new Set(p.unidades.map((u) => u.id)).size === p.unidades.length, 'Hay ids de unidad repetidos')
  .refine((p) => p.unidades.every((u) => u.cotaCoronacion.valor > u.cotaFondo.valor), 'La coronación debe quedar sobre el fondo')

export type DatosPlanta = z.infer<typeof esquemaPlanta>
export type UnidadPlanta = DatosPlanta['unidades'][number]

/** Una unidad es de ejemplo si cualquiera de sus valores lo es. */
export function unidadPlantaEsDemo(u: UnidadPlanta): boolean {
  const valores = [u.x, u.y, u.giro, u.cotaFondo, u.cotaCoronacion, u.cotaSuperficie, u.radioExplanada, ...(u.marcador ? Object.values(u.marcador) : [])]
  return valores.some((v) => v.demo === true)
}
