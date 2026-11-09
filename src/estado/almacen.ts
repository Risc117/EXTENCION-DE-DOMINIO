import { create } from 'zustand'

interface Estado {
  /** true si alguna unidad muestra datos de ejemplo. */
  hayDatosDemo: boolean
  fijarDatosDemo: (valor: boolean) => void
}

export const useEstado = create<Estado>((set) => ({
  hayDatosDemo: false,
  fijarDatosDemo: (valor) => set({ hayDatosDemo: valor }),
}))
