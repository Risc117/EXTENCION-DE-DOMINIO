import { create } from 'zustand'

/** Interruptores de las tuberías de conexión entre las estructuras y del flujo que corre por ellas. */
interface EstadoConexiones {
  visibles: boolean
  alternarConexiones: () => void
  /** Perlas que viajan por las tuberías en el sentido del flujo (T17). */
  flujo: boolean
  alternarFlujo: () => void
}

export const useConexiones = create<EstadoConexiones>((set) => ({
  visibles: true,
  alternarConexiones: () => set((s) => ({ visibles: !s.visibles })),
  flujo: true,
  alternarFlujo: () => set((s) => ({ flujo: !s.flujo })),
}))
