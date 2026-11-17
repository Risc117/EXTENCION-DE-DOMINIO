import { create } from 'zustand'

/** Interruptor de la vida de la planta: pasto, perro, palomas, aves, garza y moscas (T24). */
interface EstadoVida {
  visible: boolean
  alternarVida: () => void
}

export const useVida = create<EstadoVida>((set) => ({
  visible: true,
  alternarVida: () => set((s) => ({ visible: !s.visible })),
}))
