import { create } from 'zustand'
import { CORTE_INICIAL, NUMERO_PARTICULAS } from '../nucleo/constantes'

/** Medidas del tanque que necesita el recorrido de las partículas (metros). */
export interface ParametrosFlujo {
  radioInterior: number
  alturaIngreso: number
  alturaSalida: number
  radioZonaMezcla: number
  alturaAgitador: number
}

interface EstadoFlujo {
  flujo: ParametrosFlujo | null
  fijarFlujo: (f: ParametrosFlujo) => void
}

export const useFlujo = create<EstadoFlujo>((set) => ({
  flujo: null,
  fijarFlujo: (flujo) => set({ flujo }),
}))

/**
 * Posiciones de las partículas: x, y, z y visible (1 o 0) por cada una.
 * La simulación lo llena en cada cuadro y la escena lo lee; no pasa por React para no frenar el dibujo.
 */
export const bufferParticulas = { posiciones: new Float32Array(NUMERO_PARTICULAS * 4) }

/** Corte del tanque: plano vertical móvil que deja ver el interior. */
interface EstadoCorte {
  activo: boolean
  /** Posición del plano, de -1 a 1 (fracción del radio interior). */
  posicion: number
  alternarCorte: () => void
  fijarPosicionCorte: (v: number) => void
}

export const useCorte = create<EstadoCorte>((set) => ({
  activo: false,
  posicion: CORTE_INICIAL,
  alternarCorte: () => set((s) => ({ activo: !s.activo })),
  fijarPosicionCorte: (posicion) => set({ posicion }),
}))
