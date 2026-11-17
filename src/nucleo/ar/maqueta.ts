type Vec3 = [number, number, number]

/** Cuánto se achica la planta (de `extension` m de ancho) para que la maqueta mida `ancho` m. */
export function escalaMaqueta(ancho: number, extension: number): number {
  if (!(extension > 0)) throw new Error('La extensión de la planta debe ser mayor que cero')
  return ancho / extension
}

export interface Colocacion {
  /** Punto tocado en el mundo de AR (m). */
  origen: Vec3
  /** Punto de la planta (m, ejes de la escena) que cae en `origen`: su centro, con y = 0 en el piso. */
  centro: Vec3
  escala: number
}

/** Dónde cae en el mundo de AR un punto de la planta: el centro queda en el punto tocado, a escala; la altura se mide desde el piso tocado. */
export function aMundo(p: Vec3, c: Colocacion): Vec3 {
  return [c.origen[0] + (p[0] - c.centro[0]) * c.escala, c.origen[1] + p[1] * c.escala, c.origen[2] + (p[2] - c.centro[2]) * c.escala]
}
