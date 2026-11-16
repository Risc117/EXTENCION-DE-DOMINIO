import { create } from 'zustand'

/** Medidas del cárcamo y de las bombas que necesita la simulación (las publica main.tsx desde la unidad). */
export interface ParametrosBombeo {
  /** Área del espejo de agua del cárcamo (m²). */
  area: number
  /** Nivel (m sobre el fondo) en que arranca una bomba y en que para. */
  nivelArranque: number
  nivelParada: number
  /** Caudal de cada bomba (L/s). */
  caudalBomba: number
  /** Bombas en total (incluida la de reserva). */
  cantidad: number
}

/** Qué hace el cárcamo en este instante. */
export interface MedidasBombeo {
  /** Nivel de agua (m sobre el fondo). */
  nivel: number
  /** Índice de la bomba que funciona (0 a cantidad-1), o null si ninguna. */
  bombaActiva: number | null
  /** Bomba que arrancará la próxima vez (se alternan para que se desgasten igual). */
  proxima: number
  /** Caudal que están impulsando las bombas (L/s). */
  caudalImpulsado: number
  /** Veces que arrancó una bomba. */
  arranques: number
}

interface EstadoBombeo extends MedidasBombeo {
  parametros: ParametrosBombeo | null
  fijarParametros: (p: ParametrosBombeo) => void
  publicar: (m: MedidasBombeo) => void
}

export const MEDIDAS_BOMBEO_INICIALES: MedidasBombeo = { nivel: 0, bombaActiva: null, proxima: 0, caudalImpulsado: 0, arranques: 0 }

export const useBombeo = create<EstadoBombeo>((set) => ({
  ...MEDIDAS_BOMBEO_INICIALES,
  parametros: null,
  fijarParametros: (parametros) => set({ parametros, nivel: parametros.nivelParada }),
  publicar: (m) => set(m),
}))
