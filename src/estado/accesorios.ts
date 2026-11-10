import { create } from 'zustand'

/** Interruptor de los accesorios del plano (baranda, escalera, ventilación, válvulas y terreno). */
interface EstadoAccesorios {
  visibles: boolean
  alternarAccesorios: () => void
}

export const useAccesorios = create<EstadoAccesorios>((set) => ({
  visibles: true,
  alternarAccesorios: () => set((s) => ({ visibles: !s.visibles })),
}))
