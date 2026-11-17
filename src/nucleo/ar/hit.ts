type Vec3 = [number, number, number]

/** Posición (la última columna) de una matriz de WebXR de 16 números por columnas. */
export const posicionDeMatriz = (m: ArrayLike<number>): Vec3 => [m[12], m[13], m[14]]

/** Rayo de una matriz de WebXR (un toque o la mirada): sale de su posición hacia −z de la matriz. */
export function rayoDeMatriz(m: ArrayLike<number>): { origen: Vec3; direccion: Vec3 } {
  const largo = Math.hypot(m[8], m[9], m[10]) || 1
  return { origen: posicionDeMatriz(m), direccion: [-m[8] / largo + 0, -m[9] / largo + 0, -m[10] / largo + 0] }
}
