import { create } from 'zustand'

/** Punto del terreno bajo el mouse: metros locales y cota (m s.n.m.). */
export interface PuntoTerreno {
  x: number
  y: number
  cota: number
}

interface EstadoTerreno {
  /** false = se oculta todo el terreno (suelo, curvas, muro de contención y cota bajo el mouse): se ven las tuberías enterradas. */
  terrenoVisible: boolean
  alternarTerreno: () => void
  curvasVisibles: boolean
  alternarCurvas: () => void
  /** Lo escribe la escena y lo lee la interfaz; null si el mouse no está sobre el terreno. */
  puntero: PuntoTerreno | null
  fijarPuntero: (p: PuntoTerreno | null) => void
}

export const useTerreno = create<EstadoTerreno>((set) => ({
  terrenoVisible: true,
  alternarTerreno: () => set((s) => ({ terrenoVisible: !s.terrenoVisible })),
  curvasVisibles: true,
  alternarCurvas: () => set((s) => ({ curvasVisibles: !s.curvasVisibles })),
  puntero: null,
  fijarPuntero: (puntero) => set({ puntero }),
}))
