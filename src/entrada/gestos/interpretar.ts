import {
  CUADROS_PUNO,
  GIRO_MANO,
  SUAVIZADO_MANO,
  UMBRAL_CAMBIO_PINZA,
  UMBRAL_MOVIMIENTO_PALMA,
  ZOOM_PINZA,
} from '../../nucleo/constantes'
import type { Punto } from './puntos'
import { centroPalma, esPuno, razonPinza, suavizar } from './reconocer'

/** Lo que recordamos del cuadro anterior (valores ya suavizados). */
export interface Memoria {
  x: number
  y: number
  pinza: number
  cuadrosPuno: number
}

export interface Resultado {
  memoria: Memoria | null
  /** Cambio de ángulo de la cámara (radianes). */
  giro: { acimut: number; elevacion: number }
  /** Factor que multiplica la distancia de la cámara (1 = sin cambio). */
  zoom: number
  pausa: boolean
  detectada: boolean
}

const SIN_MANO: Resultado = { memoria: null, giro: { acimut: 0, elevacion: 0 }, zoom: 1, pausa: false, detectada: false }

/** Convierte los landmarks de un cuadro en intenciones. Función pura: la memoria entra y sale. */
export function interpretar(previa: Memoria | null, puntos: Punto[] | null): Resultado {
  if (!puntos) return SIN_MANO
  const puno = esPuno(puntos)
  const centro = centroPalma(puntos)
  const pinza = razonPinza(puntos)
  const cuadrosPuno = puno ? (previa?.cuadrosPuno ?? 0) + 1 : 0
  const pausa = cuadrosPuno >= CUADROS_PUNO

  // Sin cuadro anterior, con puño o justo al soltarlo solo se renueva la referencia: no hay saltos.
  if (!previa || puno || previa.cuadrosPuno > 0) {
    const memoria = { x: centro.x, y: centro.y, pinza, cuadrosPuno }
    return { ...SIN_MANO, memoria, pausa, detectada: true }
  }

  const x = suavizar(previa.x, centro.x, SUAVIZADO_MANO)
  const y = suavizar(previa.y, centro.y, SUAVIZADO_MANO)
  const p = suavizar(previa.pinza, pinza, SUAVIZADO_MANO)
  const dx = x - previa.x
  const dy = y - previa.y
  const dp = p - previa.pinza
  return {
    memoria: { x, y, pinza: p, cuadrosPuno },
    giro: {
      acimut: Math.abs(dx) > UMBRAL_MOVIMIENTO_PALMA ? dx * GIRO_MANO : 0,
      elevacion: Math.abs(dy) > UMBRAL_MOVIMIENTO_PALMA ? dy * GIRO_MANO : 0,
    },
    zoom: Math.abs(dp) > UMBRAL_CAMBIO_PINZA ? Math.exp(-dp * ZOOM_PINZA) : 1,
    pausa,
    detectada: true,
  }
}
