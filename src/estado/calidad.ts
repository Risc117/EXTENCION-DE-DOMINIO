import { create } from 'zustand'
import { CALIDAD_PARTICULAS } from '../nucleo/constantes'
import { guardarCalidad, leerCalidad, type Calidad } from './preferenciaCalidad'

interface EstadoCalidad {
  calidad: Calidad
  fijarCalidad: (c: Calidad) => void
}

export const useCalidad = create<EstadoCalidad>((set) => ({
  calidad: leerCalidad(),
  fijarCalidad: (calidad) => {
    guardarCalidad(calidad)
    set({ calidad })
  },
}))

/** Cuántas partículas se mueven y se dibujan con esa calidad. */
export const cantidadParticulas = (c: Calidad): number => CALIDAD_PARTICULAS[c]
