import { create } from 'zustand'

/** Punto del terreno bajo el mouse: metros locales y cota (m s.n.m.). */
export interface PuntoTerreno {
  x: number
  y: number
  cota: number
}

interface EstadoTerreno {
  curvasVisibles: boolean
  alternarCurvas: () => void
  /** Lo escribe la escena y lo lee la interfaz; null si el mouse no está sobre el terreno. */
  puntero: PuntoTerreno | null
  fijarPuntero: (p: PuntoTerreno | null) => void
}

export const useTerreno = create<EstadoTerreno>((set) => ({
  curvasVisibles: true,
  alternarCurvas: () => set((s) => ({ curvasVisibles: !s.curvasVisibles })),
  puntero: null,
  fijarPuntero: (puntero) => set({ puntero }),
}))
