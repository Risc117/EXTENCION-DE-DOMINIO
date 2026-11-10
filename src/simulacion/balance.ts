import { LITROS_POR_M3 } from '../nucleo/constantes'
import type { ParametrosTanque } from '../estado/simulacion'

export interface ResultadoPaso {
  volumen: number
  /** Caudal de salida que realmente salió (L/s): no puede ser más que lo que había. */
  caudalSalida: number
  /** Caudal que se perdió por rebose (L/s). */
  caudalRebose: number
}

/**
 * Un paso de dV/dt = Qentrada - Qsalida (caudales en L/s, volumen en m³, dt en s).
 * El volumen no baja de 0 y no pasa de área × altura total; lo que sobra rebosa.
 */
export function pasoBalance(
  volumen: number,
  caudalEntrada: number,
  caudalSalidaDeseado: number,
  dt: number,
  tanque: ParametrosTanque,
): ResultadoPaso {
  const aM3 = (ls: number) => (ls * dt) / LITROS_POR_M3
  const aLs = (m3: number) => (m3 * LITROS_POR_M3) / dt
  const disponible = volumen + aM3(caudalEntrada)
  const salida = Math.min(aM3(caudalSalidaDeseado), disponible)
  const sinTope = disponible - salida
  const maximo = tanque.area * tanque.alturaTotal
  const nuevo = Math.min(sinTope, maximo)
  return { volumen: nuevo, caudalSalida: aLs(salida), caudalRebose: aLs(sinTope - nuevo) }
}
