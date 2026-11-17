import { create } from 'zustand'

/** Estructura elegida con un clic en la escena o en el diagrama; null = ninguna. */
interface EstadoSeleccion {
  id: string | null
  seleccionar: (id: string | null) => void
}

export const useSeleccion = create<EstadoSeleccion>((set) => ({
  id: null,
  seleccionar: (id) => set({ id }),
}))
