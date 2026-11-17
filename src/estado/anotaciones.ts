import { create } from 'zustand'

/** Interruptores de las cotas (medidas con flechas) y de las etiquetas (nombres de las piezas): salen solo al acercarse a una estructura, salvo `siempre`. */
interface EstadoAnotaciones {
  cotas: boolean
  etiquetas: boolean
  /** true = se ven también de lejos (desde la vista general). */
  siempre: boolean
  alternarSiempre: () => void
  alternarCotas: () => void
  alternarEtiquetas: () => void
}

export const useAnotaciones = create<EstadoAnotaciones>((set) => ({
  cotas: true,
  etiquetas: true,
  siempre: false,
  alternarSiempre: () => set((s) => ({ siempre: !s.siempre })),
  alternarCotas: () => set((s) => ({ cotas: !s.cotas })),
  alternarEtiquetas: () => set((s) => ({ etiquetas: !s.etiquetas })),
}))
