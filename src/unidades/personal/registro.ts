import { usePersonal } from '../../estado/personal'
import type { Punto } from './geometria'

/** Dónde está cada vehículo que se ve ahora (los que esperan fuera no cuentan): lo escribe cada vehículo y lo lee la barrera. */
export const vehiculosVisibles = new Map<string, Punto>()

/** Olvida a todos los vehículos (se desmontaron o se apagó el interruptor) y baja la barrera. */
export function olvidarVehiculos(): void {
  vehiculosVisibles.clear()
  usePersonal.getState().fijarBarrera(false)
}
