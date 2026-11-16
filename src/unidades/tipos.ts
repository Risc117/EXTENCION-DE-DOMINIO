import type { ComponentType } from 'react'
import type { ParametrosBombeo } from '../estado/bombeo'
import type { ParametrosFlujo } from '../estado/flujo'
import type { ParametrosTanque } from '../estado/simulacion'

/** Lo que cada unidad sabe de sí misma (sin dónde está). */
export interface UnidadBase {
  id: string
  nombre: string
  /** true si sus datos son de ejemplo. */
  demo: boolean
  /** Lado mayor en metros; la escena lo usa para encuadrar la cámara. */
  tamano: number
  /** Medidas que necesita la simulación de nivel y caudales, si la unidad es un tanque. */
  hidraulica?: ParametrosTanque
  /** Medidas que necesita el recorrido de las partículas, si la unidad muestra flujo. */
  flujo?: ParametrosFlujo
  /** Medidas que necesita la simulación de las bombas, si la unidad es una estación de bombeo. */
  bombeo?: ParametrosBombeo
  Componente: ComponentType
}

/** Dónde está la unidad en el plano general (viene de datos/planta.json). */
export interface Ubicacion {
  /** Metros locales: x hacia el este, y hacia el norte. */
  posicion: { x: number; y: number }
  /** Grados, sentido antihorario visto desde arriba. */
  giro: number
  /** Cota del fondo (m s.n.m.). */
  cotaFondo: number
}

export type Unidad = UnidadBase & Ubicacion
