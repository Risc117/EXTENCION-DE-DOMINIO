import {
  CUADROS_PUNO,
  AJUSTE_GESTOS_DEFECTO,
  RAZON_ZONA_MUERTA_PINZA,
} from '../../nucleo/constantes'
import type { AjusteGestos } from '../../estado/almacen'
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
export function interpretar(
  previa: Memoria | null,
  puntos: Punto[] | null,
  ajuste: AjusteGestos = AJUSTE_GESTOS_DEFECTO,
): Resultado {
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

  const alfa = 1 - ajuste.suavizado
  const x = suavizar(previa.x, centro.x, alfa)
  const y = suavizar(previa.y, centro.y, alfa)
  const p = suavizar(previa.pinza, pinza, alfa)
  const dx = x - previa.x
  const dy = y - previa.y
  const dp = p - previa.pinza
  return {
    memoria: { x, y, pinza: p, cuadrosPuno },
    giro: {
      acimut: Math.abs(dx) > ajuste.zonaMuerta ? dx * ajuste.giro : 0,
      elevacion: Math.abs(dy) > ajuste.zonaMuerta ? dy * ajuste.giro : 0,
    },
    zoom: Math.abs(dp) > ajuste.zonaMuerta * RAZON_ZONA_MUERTA_PINZA ? Math.exp(-dp * ajuste.zoom) : 1,
    pausa,
    detectada: true,
  }
}
