import { z } from 'zod'
import crudo from '../../../datos/pretratamiento.json'

const base = { fuente: z.string().min(1), demo: z.boolean().optional() }
const medida = <U extends string>(unidad: U) => z.object({ valor: z.number().finite(), unidad: z.literal(unidad), ...base })

export const esquemaPretratamiento = z
  .object({
    fuente: z.string().min(1),
    anclaje: z.object({ x: medida('m'), y: medida('m') }),
    giro: medida('grados'),
    tramos: z.array(z.object({ id: z.string().min(1), desde: medida('m'), hasta: medida('m') })).min(1),
  })
  .refine((p) => p.tramos.every((t) => t.hasta.valor > t.desde.valor), 'Cada tramo debe terminar después de empezar')
  .refine((p) => p.tramos.every((t, i) => i === 0 || Math.abs(t.desde.valor - p.tramos[i - 1].hasta.valor) < 1e-9), 'Los tramos deben ir pegados, uno detrás de otro')

export type DatosPretratamiento = z.infer<typeof esquemaPretratamiento>

export const pretratamiento = esquemaPretratamiento.parse(crudo)

/** Largo (m) de un tramo de la fila. */
export const largoTramo = (p: DatosPretratamiento, id: string): number => {
  const t = p.tramos.find((x) => x.id === id)
  if (!t) throw new Error(`El tramo "${id}" no está en datos/pretratamiento.json`)
  return t.hasta.valor - t.desde.valor
}

/**
 * Dónde va el centro de un tramo en el plano general (metros locales: x este, y norte) y hacia dónde mira su flujo.
 * Cada estructura se arma con su centro en el origen y el flujo hacia +x.
 */
export function posicionTramo(p: DatosPretratamiento, id: string): { x: number; y: number; giro: number } {
  const t = p.tramos.find((x) => x.id === id)
  if (!t) throw new Error(`El tramo "${id}" no está en datos/pretratamiento.json`)
  const centro = (t.desde.valor + t.hasta.valor) / 2
  const g = (p.giro.valor * Math.PI) / 180
  return { x: p.anclaje.x.valor + centro * Math.cos(g), y: p.anclaje.y.valor + centro * Math.sin(g), giro: p.giro.valor }
}
