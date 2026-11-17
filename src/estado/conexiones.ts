import { create } from 'zustand'

/** Interruptor de las tuberías de conexión entre las estructuras. */
interface EstadoConexiones {
  visibles: boolean
  alternarConexiones: () => void
}

export const useConexiones = create<EstadoConexiones>((set) => ({
  visibles: true,
  alternarConexiones: () => set((s) => ({ visibles: !s.visibles })),
}))
