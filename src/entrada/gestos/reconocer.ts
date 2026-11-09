import { UMBRAL_PUNO } from '../../nucleo/constantes'
import { BASES_PALMA, DEDOS, INDICE_PUNTA, MEDIO_BASE, MUNECA, PULGAR_PUNTA, type Punto } from './puntos'

const distancia = (a: Punto, b: Punto) => Math.hypot(a.x - b.x, a.y - b.y)

/** Tamaño de la palma: de la muñeca a la base del dedo medio. */
export function tamanoPalma(p: Punto[]): number {
  return distancia(p[MUNECA], p[MEDIO_BASE])
}

export function centroPalma(p: Punto[]): Punto {
  const n = BASES_PALMA.length
  return {
    x: BASES_PALMA.reduce((s, i) => s + p[i].x, 0) / n,
    y: BASES_PALMA.reduce((s, i) => s + p[i].y, 0) / n,
  }
}

/** Distancia pulgar-índice dividida por el tamaño de la palma (no depende de qué tan lejos está la mano). */
export function razonPinza(p: Punto[]): number {
  const palma = tamanoPalma(p)
  return palma === 0 ? 0 : distancia(p[PULGAR_PUNTA], p[INDICE_PUNTA]) / palma
}

/** Puño: en los cuatro dedos la punta está más cerca de la muñeca que la articulación media. */
export function esPuno(p: Punto[]): boolean {
  return DEDOS.every(([media, punta]) => distancia(p[punta], p[MUNECA]) < distancia(p[media], p[MUNECA]) * UMBRAL_PUNO)
}

/** Mezcla exponencial: alfa cerca de 1 sigue rápido, cerca de 0 suaviza más. */
export function suavizar(previo: number, nuevo: number, alfa: number): number {
  return previo + (nuevo - previo) * alfa
}
