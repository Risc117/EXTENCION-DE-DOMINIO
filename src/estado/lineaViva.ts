import { create } from 'zustand'

/** Una unidad de la línea de agua (datos/linea.json) con su lugar en el diagrama. */
export interface NodoLineaViva {
  id: string
  /** Tiempo de retención con su unidad y si es dato de ejemplo; null si la unidad no tiene (homogeneizador, salida). */
  retencion: { valor: number; unidad: 's' | 'min' | 'h'; demo: boolean } | null
  destinos: { id: string; fraccion: number }[]
  columna: number
  fila: number
}

export interface CaudalNodo {
  entrada: number
  salida: number
}

interface EstadoLineaViva {
  nodos: NodoLineaViva[]
  /** Caudales (L/s) de cada unidad en este instante. */
  caudales: Record<string, CaudalNodo>
  publicarEstructura: (nodos: NodoLineaViva[]) => void
  publicarCaudales: (caudales: Record<string, CaudalNodo>) => void
}

/** La simulación publica aquí la estructura de la línea y los caudales de cada unidad; la interfaz los lee. */
export const useLineaViva = create<EstadoLineaViva>((set) => ({
  nodos: [],
  caudales: {},
  publicarEstructura: (nodos) => set({ nodos }),
  publicarCaudales: (caudales) => set({ caudales }),
}))
