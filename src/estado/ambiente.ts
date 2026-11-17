import { create } from 'zustand'
import { HORAS_POR_DIA } from '../nucleo/constantes'

/** Dónde y cuándo se calcula el sol (de datos/ambiente.json). */
export interface Sitio {
  latitud: number
  mes: number
  dia: number
}

/** Hora del día que ve la escena (la de la simulación o una fijada a mano) y dónde y cuándo se calcula el sol. */
interface EstadoAmbiente {
  sitio: Sitio | null
  publicarSitio: (s: Sitio) => void
  /** Hora fijada (0 a 24); null = seguir la hora de la simulación. */
  horaFija: number | null
  fijarHora: (hora: number) => void
  seguirSimulacion: () => void
}

const dentroDelDia = (h: number): number => ((h % HORAS_POR_DIA) + HORAS_POR_DIA) % HORAS_POR_DIA

export const useAmbiente = create<EstadoAmbiente>((set) => ({
  sitio: null,
  publicarSitio: (sitio) => set({ sitio }),
  horaFija: null,
  fijarHora: (hora) => set({ horaFija: dentroDelDia(hora) }),
  seguirSimulacion: () => set({ horaFija: null }),
}))

/** La hora que se usa: la fijada si hay una, si no la de la simulación. */
export const horaAmbiente = (horaSimulacion: number, horaFija: number | null): number => horaFija ?? horaSimulacion
