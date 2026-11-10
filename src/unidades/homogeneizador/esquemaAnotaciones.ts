import { z } from 'zod'
import { medidaPorRuta } from './anotaciones/medidaPorRuta'

const ruta = z.string().min(1)
const texto = z.string().min(1)
const angulo = z.number().min(0).max(360)

const cota = z.discriminatedUnion('tipo', [
  /** Línea en planta sobre el diámetro. */
  z.object({ id: z.string().min(1), tipo: z.literal('diametro'), medida: ruta, texto }),
  /** Línea vertical junto al muro; `base` es la medida donde empieza (si no, el fondo). */
  z.object({
    id: z.string().min(1),
    tipo: z.literal('altura'),
    medida: ruta,
    base: ruta.optional(),
    angulo,
    columna: z.number().int().min(0),
    texto,
  }),
  /** Línea corta a través del espesor del muro. */
  z.object({ id: z.string().min(1), tipo: z.literal('espesor'), medida: ruta, angulo, texto }),
])

export const OBJETIVOS = ['ingreso', 'salida', 'rebose', 'agitador', 'zonaMezcla', 'bocaAcceso', 'baranda', 'nivelAgua'] as const

const etiqueta = z.object({
  id: z.string().min(1),
  objetivo: z.enum(OBJETIVOS),
  texto,
  medida: ruta.optional(),
  /** Dónde queda el texto respecto de la pieza (m). */
  desfase: z.tuple([z.number(), z.number(), z.number()]),
  /** Las etiquetas principales se ven también en calidad baja. */
  prioridad: z.boolean().optional(),
})

export const esquemaAnotaciones = z.object({ cotas: z.array(cota), etiquetas: z.array(etiqueta) })

export type DatosAnotaciones = z.infer<typeof esquemaAnotaciones>
export type DefCota = DatosAnotaciones['cotas'][number]
export type DefEtiqueta = DatosAnotaciones['etiquetas'][number]

/** Revisa lo que zod no ve: ids únicos, rutas que existen y textos con {valor} que tengan de dónde sacarlo. */
export function revisarAnotaciones(d: { anotaciones: DatosAnotaciones }): string | null {
  const { cotas, etiquetas } = d.anotaciones
  const ids = [...cotas, ...etiquetas].map((x) => x.id)
  if (new Set(ids).size !== ids.length) return 'Hay cotas o etiquetas con el mismo id'
  for (const c of cotas) {
    for (const r of [c.medida, c.tipo === 'altura' ? c.base : undefined]) {
      if (r !== undefined && !medidaPorRuta(d, r)) return `La cota "${c.id}" apunta a una medida que no existe: ${r}`
    }
  }
  for (const e of etiquetas) {
    if (e.medida !== undefined && !medidaPorRuta(d, e.medida)) return `La etiqueta "${e.id}" apunta a una medida que no existe: ${e.medida}`
    if (e.texto.includes('{valor}') && e.medida === undefined && e.objetivo !== 'nivelAgua') {
      return `La etiqueta "${e.id}" usa {valor} pero no tiene medida`
    }
  }
  return null
}
