/** Punto de la mano en coordenadas normalizadas de la imagen (0-1). */
export interface Punto {
  x: number
  y: number
}

/** Índices de los 21 puntos de MediaPipe que usamos. */
export const MUNECA = 0
export const PULGAR_PUNTA = 4
export const INDICE_PUNTA = 8
export const MEDIO_BASE = 9
/** Pares [articulación media, punta] de índice, medio, anular y meñique. */
export const DEDOS: ReadonlyArray<readonly [number, number]> = [
  [6, 8],
  [10, 12],
  [14, 16],
  [18, 20],
]
/** Puntos cuyo promedio es el centro de la palma. */
export const BASES_PALMA = [0, 5, 9, 13, 17]
