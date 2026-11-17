import { create } from 'zustand'

/** Parámetros de calidad del agua que se siguen: DBO₅, DQO, sólidos suspendidos y coliformes termotolerantes. */
export const PARAMETROS = ['dbo', 'dqo', 'sst', 'cf'] as const
export type Parametro = (typeof PARAMETROS)[number]
/** Concentración de cada parámetro (mg/L; coliformes en NMP/100 mL). */
export type Concentracion = Record<Parametro, number>

/** Calidad a la entrada y a la salida de una unidad de la línea de agua. */
export interface EtapaCalidad {
  id: string
  entrada: Concentracion
  salida: Concentracion
  /** Fracción removida (0 a 1) en la unidad. */
  remocion: Concentracion
  /** true si ese porcentaje de remoción es Dato de ejemplo. */
  demo: Record<Parametro, boolean>
}

export interface LimitesCalidad {
  /** Límites máximos permisibles de la descarga. */
  descarga: Concentracion
  /** ECA del cuerpo receptor (referencia); no incluye sólidos. */
  eca: Partial<Concentracion>
}

interface EstadoCalidadAgua {
  etapas: EtapaCalidad[]
  limites: LimitesCalidad | null
  /** Cómo se estimó lo que no está en las hojas de cálculo. */
  metodo: string
  publicar: (etapas: EtapaCalidad[], limites: LimitesCalidad, metodo: string) => void
}

/** La simulación publica aquí la calidad de cada unidad (valores de diseño); la interfaz la lee. */
export const useCalidadAgua = create<EstadoCalidadAgua>((set) => ({
  etapas: [],
  limites: null,
  metodo: '',
  publicar: (etapas, limites, metodo) => set({ etapas, limites, metodo }),
}))
