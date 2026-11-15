import { z } from 'zod'
import { SEGUNDOS_POR_HORA } from '../nucleo/constantes'

const retencion = z.object({
  valor: z.number().nonnegative(),
  unidad: z.enum(['s', 'min', 'h']),
  fuente: z.string().min(1),
  demo: z.boolean(),
})

const destino = z.object({
  id: z.string().min(1),
  fraccion: z.number().positive().max(1),
  fuente: z.string().min(1).optional(),
  demo: z.boolean().optional(),
})

const nodo = z.object({
  id: z.string().min(1),
  tipo: z.enum(['paso', 'homogeneizador', 'salida']),
  retencion: retencion.optional(),
  destinos: z.array(destino),
})

export const esquemaLinea = z
  .object({
    fuente: z.string().min(1),
    demo: z.boolean(),
    entrada: z.string().min(1),
    nodos: z.array(nodo).min(2),
  })
  .superRefine((l, ctx) => {
    const pos = new Map(l.nodos.map((n, i) => [n.id, i]))
    const mal = (m: string) => ctx.addIssue({ code: 'custom', message: m })
    if (pos.size !== l.nodos.length) mal('Hay ids de unidad repetidos')
    if (l.nodos[0]?.id !== l.entrada) mal('La entrada debe ser la primera unidad de la lista')
    l.nodos.forEach((n, i) => {
      if (n.tipo === 'paso' && !n.retencion) mal(`La unidad ${n.id} necesita tiempo de retención`)
      if (n.tipo === 'salida' && n.destinos.length > 0) mal('La salida no puede tener destinos')
      if (n.tipo !== 'salida' && n.destinos.length === 0) mal(`La unidad ${n.id} no tiene a dónde ir`)
      if (n.destinos.length > 0 && Math.abs(n.destinos.reduce((s, d) => s + d.fraccion, 0) - 1) > 1e-9)
        mal(`Las fracciones de ${n.id} deben sumar 1`)
      for (const d of n.destinos) {
        const j = pos.get(d.id)
        if (j === undefined) mal(`${n.id} manda agua a ${d.id}, que no existe`)
        else if (j <= i) mal(`${n.id} manda agua hacia atrás (${d.id}): la lista debe ir en orden de la línea`)
      }
    })
  })

export type DatosLinea = z.infer<typeof esquemaLinea>
export type DatosNodo = DatosLinea['nodos'][number]

const SEGUNDOS = { s: 1, min: 60, h: SEGUNDOS_POR_HORA }

/** Tiempo de retención en segundos. */
export function retencionSegundos(n: DatosNodo): number {
  return n.retencion ? n.retencion.valor * SEGUNDOS[n.retencion.unidad] : 0
}
