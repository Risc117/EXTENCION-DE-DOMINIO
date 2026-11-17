import { create } from 'zustand'

/** Interruptor del entorno de la planta: edificios, vías, cerco y árboles (T16.5). */
interface EstadoEntorno {
  visible: boolean
  alternarEntorno: () => void
}

export const useEntorno = create<EstadoEntorno>((set) => ({
  visible: true,
  alternarEntorno: () => set((s) => ({ visible: !s.visible })),
}))
