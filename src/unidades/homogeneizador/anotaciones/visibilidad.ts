import { MARGEN_OCLUSION } from '../../../nucleo/constantes'
import { planoCorte } from '../../comun/corte'
import type { Vec3 } from '../../comun/tiposAnotaciones'

/** true si el corte deja ese punto fuera (mismo plano que usa el recorte de las piezas). */
export function quedaCortado(punto: Vec3, activo: boolean, posicion: number, radio: number): boolean {
  const p = planoCorte(activo, posicion, radio)
  if (!p) return false
  return p.normal[0] * punto[0] + p.normal[1] * punto[1] + p.normal[2] * punto[2] + p.constante < 0
}

/** Parte del recorrido (con t en 0..1) que cumple a + b·t entre min y max; null si ninguna. */
function intervalo(a: number, b: number, min: number, max: number): [number, number] | null {
  if (Math.abs(b) < 1e-9) return a >= min && a <= max ? [0, 1] : null
  const t1 = (min - a) / b
  const t2 = (max - a) / b
  return [Math.min(t1, t2), Math.max(t1, t2)]
}

/** true si el segmento cámara→punto atraviesa el tanque (cilindro macizo de eje vertical centrado en el origen). */
export function tapaElTanque(camara: Vec3, punto: Vec3, radio: number, yMin: number, yMax: number): boolean {
  const dx = punto[0] - camara[0]
  const dy = punto[1] - camara[1]
  const dz = punto[2] - camara[2]
  const a = dx * dx + dz * dz
  const b = 2 * (camara[0] * dx + camara[2] * dz)
  const c = camara[0] ** 2 + camara[2] ** 2 - radio * radio
  let dentro: [number, number] | null
  if (a < 1e-9) {
    dentro = c < 0 ? [0, 1] : null
  } else {
    const disc = b * b - 4 * a * c
    dentro = disc <= 0 ? null : [(-b - Math.sqrt(disc)) / (2 * a), (-b + Math.sqrt(disc)) / (2 * a)]
  }
  const alto = intervalo(camara[1], dy, yMin, yMax)
  if (!dentro || !alto) return false
  const desde = Math.max(dentro[0], alto[0], 0)
  const hasta = Math.min(dentro[1], alto[1], 1)
  return hasta - desde > MARGEN_OCLUSION
}

/** En calidad baja quedan solo las principales. */
export function filtrarPorCalidad<T extends { prioridad?: boolean }>(lista: T[], calidad: 'baja' | 'alta'): T[] {
  return calidad === 'alta' ? lista : lista.filter((x) => x.prioridad === true)
}
