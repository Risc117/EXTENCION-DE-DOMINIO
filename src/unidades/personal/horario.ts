import { lucesEncendidas } from '../../nucleo/solar'
import type { Punto } from './geometria'

export interface Presentes {
  tecnicos: number
  vehiculos: number
  vigilante: boolean
  faros: boolean
}

/** Quiénes actúan según la elevación del sol: de día técnicos y todos los vehículos; de noche solo el vigilante y un vehículo, con faros. */
export function quienesActuan(elevacion: number, tecnicos: number, vehiculos: number): Presentes {
  const noche = lucesEncendidas(elevacion)
  return noche ? { tecnicos: 0, vehiculos: Math.min(1, vehiculos), vigilante: true, faros: true } : { tecnicos, vehiculos, vigilante: false, faros: false }
}

/** true si algún vehículo está a menos de `radio` m del centro de la barrera. */
export function barreraAbierta(vehiculos: Punto[], centro: Punto, radio: number): boolean {
  return vehiculos.some((v) => Math.hypot(v.x - centro.x, v.y - centro.y) < radio)
}

/** Ángulo (°) de la pluma tras `dt` s: sube o baja a `rapidez` °/s hacia el máximo (abierta) o hacia 0 (cerrada). */
export function anguloPluma(actual: number, abierta: boolean, dt: number, maximo: number, rapidez: number): number {
  const meta = abierta ? maximo : 0
  const paso = rapidez * dt
  return Math.abs(meta - actual) <= paso ? meta : actual + Math.sign(meta - actual) * paso
}
