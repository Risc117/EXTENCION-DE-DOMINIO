import { create } from 'zustand'

/** Personas y vehículos (T24.1): interruptor y si la barrera de la garita debe estar levantada (hay un vehículo cerca). */
interface EstadoPersonal {
  visible: boolean
  alternarPersonal: () => void
  barreraAbierta: boolean
  fijarBarrera: (abierta: boolean) => void
}

export const usePersonal = create<EstadoPersonal>((set) => ({
  visible: true,
  alternarPersonal: () => set((s) => ({ visible: !s.visible })),
  barreraAbierta: false,
  fijarBarrera: (barreraAbierta) => set((s) => (s.barreraAbierta === barreraAbierta ? s : { barreraAbierta })),
}))
