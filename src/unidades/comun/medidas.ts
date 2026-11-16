import { z } from 'zod'

export { medida } from './medida'

const base = { fuente: z.string().min(1), demo: z.boolean().optional() }

/** Número positivo con unidad y fuente (caudales, ángulos, velocidades...). */
export const positivo = <U extends string>(unidad: U) => z.object({ valor: z.number().positive(), unidad: z.literal(unidad), ...base })

/** Número con unidad y fuente que puede ser cero. */
export const noNegativo = <U extends string>(unidad: U) => z.object({ valor: z.number().min(0), unidad: z.literal(unidad), ...base })

/** true si alguna de las medidas es dato de ejemplo. */
export const hayEjemplo = (valores: { demo?: boolean }[]): boolean => valores.some((v) => v.demo === true)

/** Todas las medidas (objetos con `valor`) que cuelgan de un objeto de datos, en cualquier nivel. */
export function todasLasMedidas(datos: unknown): { valor: number; fuente: string; demo?: boolean }[] {
  if (typeof datos !== 'object' || datos === null) return []
  const o = datos as Record<string, unknown>
  if (typeof o.valor === 'number' && typeof o.fuente === 'string') return [o as { valor: number; fuente: string; demo?: boolean }]
  return Object.values(o).flatMap(todasLasMedidas)
}

/** Lado de un elemento respecto del eje: -1 o 1. */
export const signo = z.object({ valor: z.union([z.literal(-1), z.literal(1)]), unidad: z.literal('adim'), ...base })
