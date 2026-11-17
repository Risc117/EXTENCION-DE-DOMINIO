import { create } from 'zustand'

/** Interruptor de la vegetación de los alrededores: árboles, arbustos y pasto fuera del cerco (T34). */
interface EstadoVegetacion {
  visible: boolean
  alternarVegetacion: () => void
}

export const useVegetacion = create<EstadoVegetacion>((set) => ({
  visible: true,
  alternarVegetacion: () => set((s) => ({ visible: !s.visible })),
}))
