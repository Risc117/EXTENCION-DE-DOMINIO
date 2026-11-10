import { create } from 'zustand'
import { VELOCIDAD_INICIAL } from '../nucleo/constantes'

/** Medidas del tanque que necesita la simulación (las publica quien arma la escena). */
export interface ParametrosTanque {
  /** Área útil del espejo de agua (m²). */
  area: number
  alturaUtil: number
  alturaTotal: number
  /** Altura del eje de la tubería de salida sobre el fondo (m). */
  alturaEjeSalida: number
  /** Diámetro de la tubería de salida (m). */
  diametroSalida: number
}

/** constante: salida fija (promedio del día o ajustada) · gravedad: depende del nivel. */
export type ModoSalida = 'constante' | 'gravedad'

/** Valores que calcula la simulación en cada cuadro. */
export interface Medidas {
  hora: number
  volumen: number
  nivel: number
  caudalEntrada: number
  caudalSalida: number
  caudalRebose: number
}

interface EstadoSim extends Medidas {
  tanque: ParametrosTanque | null
  fijarTanque: (t: ParametrosTanque) => void
  diasDisponibles: number[]
  fijarDias: (dias: number[]) => void
  dia: number
  elegirDia: (dia: number) => void
  /** Promedio de caudal de entrada del día elegido (L/s). */
  promedioDia: number
  corriendo: boolean
  alternarCorriendo: () => void
  velocidad: number
  fijarVelocidad: (v: number) => void
  modoSalida: ModoSalida
  fijarModoSalida: (m: ModoSalida) => void
  /** Caudal de salida elegido a mano (L/s); null = usar el promedio del día. */
  salidaAjuste: number | null
  fijarSalidaAjuste: (v: number | null) => void
  /** La simulación publica sus resultados aquí. */
  publicar: (m: Partial<Medidas> & { promedioDia?: number }) => void
  reiniciar: () => void
}

const inicio = {
  dia: 1,
  hora: 0,
  volumen: 0,
  nivel: 0,
  caudalEntrada: 0,
  caudalSalida: 0,
  caudalRebose: 0,
  promedioDia: 0,
  salidaAjuste: null,
}

export const useSim = create<EstadoSim>((set) => ({
  ...inicio,
  tanque: null,
  fijarTanque: (tanque) => set({ tanque }),
  diasDisponibles: [],
  fijarDias: (diasDisponibles) => set({ diasDisponibles }),
  elegirDia: (dia) => set({ ...inicio, dia }),
  corriendo: true,
  alternarCorriendo: () => set((s) => ({ corriendo: !s.corriendo })),
  velocidad: VELOCIDAD_INICIAL,
  fijarVelocidad: (velocidad) => set({ velocidad }),
  modoSalida: 'constante',
  fijarModoSalida: (modoSalida) => set({ modoSalida }),
  fijarSalidaAjuste: (salidaAjuste) => set({ salidaAjuste }),
  publicar: (m) => set(m),
  reiniciar: () => set({ ...inicio, corriendo: true, velocidad: VELOCIDAD_INICIAL, modoSalida: 'constante' }),
}))
