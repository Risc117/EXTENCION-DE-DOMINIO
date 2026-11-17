import { create } from 'zustand'

/** Parámetros de la mezcla con el río: los de la cadena de calidad más el oxígeno disuelto (od). */
export type ParametroMezcla = 'dbo' | 'dqo' | 'sst' | 'cf' | 'od'

export interface LimiteMezcla {
  valor: number
  tipo: 'maximo' | 'minimo'
  cumple: boolean
}

export interface FilaMezcla {
  parametro: ParametroMezcla
  descarga: number
  mezcla: number
  /** Límite del cuerpo receptor (ECA); null si el parámetro no tiene. */
  eca: LimiteMezcla | null
  /** Límite máximo permisible de la descarga (LMP); null si el parámetro no tiene. */
  lmp: LimiteMezcla | null
}

export interface EscenarioMezcla {
  id: string
  nombre: string
  /** Caudal del río (L/s). */
  caudalRio: number
  filas: FilaMezcla[]
}

export interface DiferenciaDescarga {
  parametro: 'dbo' | 'dqo' | 'sst' | 'cf'
  memoria: number
  visor: number
  /** visor − memoria. */
  diferencia: number
  /** Cuántas veces es mayor la cifra del visor. */
  veces: number
  /** true si difieren en menos de 0.1 %. */
  coincide: boolean
}

interface EstadoMezclaRio {
  rio: string
  fuente: string
  escenarios: EscenarioMezcla[]
  diferencias: DiferenciaDescarga[]
  publicar: (rio: string, fuente: string, escenarios: EscenarioMezcla[], diferencias: DiferenciaDescarga[]) => void
}

/** La simulación publica aquí la mezcla de la descarga con el río (memoria, sección 18) y su diferencia con la cadena del visor; la interfaz la lee. */
export const useMezclaRio = create<EstadoMezclaRio>((set) => ({
  rio: '',
  fuente: '',
  escenarios: [],
  diferencias: [],
  publicar: (rio, fuente, escenarios, diferencias) => set({ rio, fuente, escenarios, diferencias }),
}))
