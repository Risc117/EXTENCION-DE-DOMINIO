import type { ComponentType } from 'react'

export interface Unidad {
  id: string
  nombre: string
  /** true si sus datos son de ejemplo. */
  demo: boolean
  /** Lado mayor en metros; la escena lo usa para encuadrar la cámara. */
  tamano: number
  Componente: ComponentType
}
