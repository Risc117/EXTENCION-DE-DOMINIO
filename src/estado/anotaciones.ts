import { create } from 'zustand'

/** Interruptores de las cotas (medidas con flechas) y de las etiquetas (nombres de las piezas). */
interface EstadoAnotaciones {
  cotas: boolean
  etiquetas: boolean
  alternarCotas: () => void
  alternarEtiquetas: () => void
}

export const useAnotaciones = create<EstadoAnotaciones>((set) => ({
  cotas: true,
  etiquetas: true,
  alternarCotas: () => set((s) => ({ cotas: !s.cotas })),
  alternarEtiquetas: () => set((s) => ({ etiquetas: !s.etiquetas })),
}))
