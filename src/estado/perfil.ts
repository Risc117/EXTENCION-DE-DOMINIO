import { create } from 'zustand'

/** Punto del perfil: progresiva (m recorridos desde la entrada de agua residual) y cota (m s.n.m.). */
export interface PuntoPerfil {
  s: number
  cota: number
}

/** Un tramo de la línea de agua: o una tubería (`tubo`) o el paso por una o más unidades (`unidad`). */
export interface SegmentoPerfil {
  tipo: 'tubo' | 'unidad'
  id: string
  puntos: PuntoPerfil[]
}

export interface UnidadPerfil {
  id: string
  nombre: string
  desde: number
  hasta: number
  /** Cota de fondo y de coronación (m s.n.m.). */
  fondo: number
  corona: number
  /** true si el fondo o la coronación son Dato de ejemplo. */
  demo: boolean
}

export interface BuzonPerfil {
  id: string
  s: number
  /** Cota de la tapa (m s.n.m.) y del fondo de la tubería que llega (de ejemplo). */
  tapa: number
  fondo: number
  /** true si la tapa o el fondo son Dato de ejemplo. */
  demo: boolean
}

export interface DatosPerfil {
  /** Largo total (m) y cota mínima y máxima de todo lo dibujado. */
  largo: number
  cotaMinima: number
  cotaMaxima: number
  terreno: PuntoPerfil[]
  segmentos: SegmentoPerfil[]
  unidades: UnidadPerfil[]
  buzones: BuzonPerfil[]
  /** true si alguna cota es Dato de ejemplo. */
  hayEjemplo: boolean
  fuente: string
}

interface EstadoPerfil {
  perfil: DatosPerfil | null
  publicar: (p: DatosPerfil) => void
}

/** El perfil hidráulico de la línea de agua; se publica al arrancar. */
export const usePerfil = create<EstadoPerfil>((set) => ({ perfil: null, publicar: (perfil) => set({ perfil }) }))
