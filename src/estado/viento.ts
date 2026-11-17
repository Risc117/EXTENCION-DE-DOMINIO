import { create } from 'zustand'

/** Viento de este instante (con ráfaga): lo publica la escena unas 5 veces por segundo; la interfaz y los efectos lo leen. */
interface EstadoViento {
  /** Velocidad (m/s) y dirección de donde sopla (° desde el norte, horario). */
  velocidad: number
  desde: number
  /** Dirección unitaria (x este, z sur de la escena) hacia donde sopla, con el giro del norte ya aplicado. */
  haciaX: number
  haciaZ: number
  publicar: (velocidad: number, desde: number, haciaX: number, haciaZ: number) => void
}

export const useViento = create<EstadoViento>((set) => ({
  velocidad: 0,
  desde: 0,
  haciaX: 0,
  haciaZ: -1,
  publicar: (velocidad, desde, haciaX, haciaZ) => set({ velocidad, desde, haciaX, haciaZ }),
}))
