import type { ComponentType } from 'react'
import type { ParametrosTanque } from '../estado/simulacion'

export interface Unidad {
  id: string
  nombre: string
  /** true si sus datos son de ejemplo. */
  demo: boolean
  /** Lado mayor en metros; la escena lo usa para encuadrar la cámara. */
  tamano: number
  /** Medidas que necesita la simulación de nivel y caudales, si la unidad es un tanque. */
  hidraulica?: ParametrosTanque
  Componente: ComponentType
}
