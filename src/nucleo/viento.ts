import {
  ARBOL_BALANCEO_MAXIMO,
  ARBOL_FRECUENCIA,
  ARBOL_RAD_POR_MS,
  GRADOS_ANGULO_RECTO,
  GRADOS_MEDIA_VUELTA,
  GRADOS_POR_PUNTO_ROSA,
  GRADOS_VUELTA,
  LLAMA_GRADOS_POR_MS,
  LLAMA_INCLINACION_MAXIMA,
  NOMBRES_ROSA,
  VELOCIDAD_MANGA_HORIZONTAL,
} from './constantesViento'

const RAD = Math.PI / GRADOS_MEDIA_VUELTA

/** Velocidad (m/s) del viento en el instante `t` (s): la media con una ráfaga senoidal de `amplitud` (fracción de la media) y `periodo` (s); nunca negativa. */
export function velocidadConRafaga(media: number, amplitud: number, periodo: number, t: number): number {
  return Math.max(0, media * (1 + amplitud * Math.sin((2 * Math.PI * t) / periodo)))
}

/** Dirección unitaria (x este, z sur de la escena) HACIA donde sopla un viento que viene de `desde` grados (desde el norte, horario); `giroNorte` gira el norte de la escena. */
export function direccionHacia(desde: number, giroNorte = 0): [number, number] {
  const a = (desde + GRADOS_MEDIA_VUELTA + giroNorte) * RAD
  return [Math.sin(a), -Math.cos(a)]
}

/** Nombre en la rosa de los vientos (16 puntos, O = oeste) del punto de donde viene el viento. */
export function nombreDireccion(desde: number): string {
  const punto = Math.round((((desde % GRADOS_VUELTA) + GRADOS_VUELTA) % GRADOS_VUELTA) / GRADOS_POR_PUNTO_ROSA) % NOMBRES_ROSA.length
  return NOMBRES_ROSA[punto]
}

/** Inclinación (°) de la llama del quemador hacia donde sopla: crece con la velocidad, con tope. */
export const inclinacionLlama = (velocidad: number): number => Math.min(LLAMA_INCLINACION_MAXIMA, Math.max(0, velocidad) * LLAMA_GRADOS_POR_MS)

/** Balanceo (rad) de un árbol en el instante `t`, con una `fase` (0 a 1) propia: más viento, más balanceo (con tope); quieto sin viento. */
export function balanceoArbol(t: number, fase: number, velocidad: number): number {
  if (velocidad <= 0) return 0
  return Math.min(ARBOL_BALANCEO_MAXIMO, velocidad * ARBOL_RAD_POR_MS) * Math.sin(2 * Math.PI * (ARBOL_FRECUENCIA * t + fase))
}

/** Elevación (°) de la manga sobre la horizontal: cuelga (90°) con calma y queda horizontal (0°) desde VELOCIDAD_MANGA_HORIZONTAL. */
export const elevacionManga = (velocidad: number): number => GRADOS_ANGULO_RECTO * (1 - Math.min(1, Math.max(0, velocidad) / VELOCIDAD_MANGA_HORIZONTAL))
