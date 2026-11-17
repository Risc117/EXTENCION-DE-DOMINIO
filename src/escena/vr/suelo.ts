import type { Vec3 } from '../../unidades/ubicacion'

export interface PuntoSuelo {
  x: number
  y: number
  z: number
  /** Distancia (m) desde el ojo. */
  distancia: number
}

/** Metros que avanza el rayo entre revisiones, y veces que se afina el punto entre dos revisiones. */
const PASO_RAYO = 0.5
const AFINADOS = 20

/**
 * Dónde toca el suelo el rayo que sale del ojo `origen` en la `direccion` (unitaria), sin pasar de `maxima` m. `alturaSuelo(x, z)` da la altura del terreno.
 * null si mira al horizonte, hacia arriba o más lejos del límite.
 */
export function puntoEnSuelo(origen: Vec3, direccion: Vec3, alturaSuelo: (x: number, z: number) => number, maxima: number, paso = PASO_RAYO): PuntoSuelo | null {
  const en = (t: number): Vec3 => [origen[0] + direccion[0] * t, origen[1] + direccion[1] * t, origen[2] + direccion[2] * t]
  const sobre = (t: number): boolean => {
    const p = en(t)
    return p[1] > alturaSuelo(p[0], p[2])
  }
  if (!sobre(0)) return null
  let antes = 0
  for (let t = paso; t <= maxima + paso; t += paso) {
    const ahora = Math.min(t, maxima)
    if (!sobre(ahora)) {
      let [a, b] = [antes, ahora]
      for (let i = 0; i < AFINADOS; i++) {
        const m = (a + b) / 2
        if (sobre(m)) a = m
        else b = m
      }
      const [x, y, z] = en(b)
      return { x, y, z, distancia: b }
    }
    antes = ahora
    if (ahora === maxima) break
  }
  return null
}
