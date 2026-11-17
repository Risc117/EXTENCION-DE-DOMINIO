import type { DatosNodo } from './lineaEsquema'

/** Lugar de una unidad en el diagrama de bloques: columna (orden de la línea) y fila dentro de su columna. */
export interface LugarNodo {
  id: string
  columna: number
  fila: number
}

/** Columna = el camino más largo desde la entrada hasta la unidad; fila = orden de aparición dentro de la columna (los ramales quedan uno sobre otro). */
export function disponerLinea(nodos: DatosNodo[]): LugarNodo[] {
  const columna = new Map<string, number>(nodos.map((n) => [n.id, 0]))
  for (const n of nodos) for (const d of n.destinos) columna.set(d.id, Math.max(columna.get(d.id) ?? 0, (columna.get(n.id) ?? 0) + 1))
  const usadas = new Map<number, number>()
  return nodos.map((n) => {
    const c = columna.get(n.id) ?? 0
    const fila = usadas.get(c) ?? 0
    usadas.set(c, fila + 1)
    return { id: n.id, columna: c, fila }
  })
}
