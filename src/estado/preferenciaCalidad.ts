import { CLAVE_CALIDAD, UMBRAL_PANTALLA_CHICA } from '../nucleo/constantes'
import { almacenamientoNavegador, type Almacenamiento } from './preferenciaPanel'

export type Calidad = 'baja' | 'alta'

const esCalidad = (v: unknown): v is Calidad => v === 'baja' || v === 'alta'

/** Lo guardado; si no hay nada, "baja" en pantallas chicas (celular) y "alta" en las demás. */
export function leerCalidad(
  alm: Almacenamiento | undefined = almacenamientoNavegador(),
  anchoPantalla: number = globalThis.innerWidth ?? Infinity,
): Calidad {
  try {
    const guardada = alm?.getItem(CLAVE_CALIDAD)
    if (esCalidad(guardada)) return guardada
  } catch {
    // sin almacenamiento: se usa el valor por defecto
  }
  return anchoPantalla < UMBRAL_PANTALLA_CHICA ? 'baja' : 'alta'
}

export function guardarCalidad(calidad: Calidad, alm: Almacenamiento | undefined = almacenamientoNavegador()): void {
  try {
    alm?.setItem(CLAVE_CALIDAD, calidad)
  } catch {
    // sin almacenamiento: la calidad sigue funcionando, solo no se recuerda
  }
}
