import {
  ALTURA_MEZCLA,
  CAUDAL_REFERENCIA_LS,
  DISPERSION_CHORRO,
  DURACION_MEZCLA,
  ESPERA_MAXIMA_PARTICULA,
  FACTOR_VELOCIDAD_MAXIMO,
  GIRO_REMOLINO,
  LLEGADA_SALIDA,
  NIVEL_MINIMO_VISIBLE,
  RADIO_MINIMO_REMOLINO,
  RELAJACION_MEZCLA,
  RETRANQUE_INGRESO,
  VELOCIDAD_CAIDA,
  VELOCIDAD_SALIDA_PARTICULA,
} from '../nucleo/constantes'
import type { ParametrosFlujo } from '../estado/flujo'
import { entre } from './azar'

/** 0 = cae del ingreso · 1 = da vueltas en la mezcla · 2 = va hacia la salida. */
export interface Particula {
  fase: 0 | 1 | 2
  /** Segundos que faltan para soltarla en el ingreso (fase 0). */
  espera: number
  x: number
  y: number
  z: number
  /** Mezcla: radio y ángulo alrededor del agitador, y a dónde tiende (radio, fracción del nivel). */
  r: number
  theta: number
  omega: number
  rObjetivo: number
  alturaRelativa: number
  /** Segundos que le quedan dando vueltas. */
  resta: number
}

const factor = (caudal: number) => Math.min(FACTOR_VELOCIDAD_MAXIMO, Math.max(0, caudal / CAUDAL_REFERENCIA_LS))

function soltarEnIngreso(p: Particula, f: ParametrosFlujo, azar: () => number) {
  p.fase = 0
  p.espera = azar() * ESPERA_MAXIMA_PARTICULA
  p.x = -(f.radioInterior - RETRANQUE_INGRESO)
  p.y = f.alturaIngreso
  p.z = (azar() - 0.5) * DISPERSION_CHORRO
}

export function crearParticulas(n: number, f: ParametrosFlujo, azar: () => number): Particula[] {
  return Array.from({ length: n }, () => {
    const p: Particula = { fase: 0, espera: 0, x: 0, y: 0, z: 0, r: 0, theta: 0, omega: 0, rObjetivo: 0, alturaRelativa: 0, resta: 0 }
    soltarEnIngreso(p, f, azar)
    return p
  })
}

function empezarMezcla(p: Particula, f: ParametrosFlujo, azar: () => number) {
  p.fase = 1
  p.r = Math.hypot(p.x, p.z)
  p.theta = Math.atan2(p.z, p.x)
  p.omega = entre(azar, GIRO_REMOLINO.min, GIRO_REMOLINO.max)
  p.rObjetivo = entre(azar, RADIO_MINIMO_REMOLINO, f.radioZonaMezcla)
  p.alturaRelativa = entre(azar, ALTURA_MEZCLA.min, ALTURA_MEZCLA.max)
  p.resta = entre(azar, DURACION_MEZCLA.min, DURACION_MEZCLA.max)
}

/**
 * Mueve las partículas `dt` segundos reales. Es un efecto ilustrativo:
 * la caída sigue el caudal de entrada, el remolino lo mueve el agitador y el avance a la salida sigue el caudal de salida.
 */
export function avanzarParticulas(
  ps: Particula[],
  f: ParametrosFlujo,
  nivel: number,
  caudalEntrada: number,
  caudalSalida: number,
  dt: number,
  azar: () => number,
): void {
  const fEntrada = factor(caudalEntrada)
  const fSalida = factor(caudalSalida)
  const agua = Math.max(0, nivel)
  const acercar = Math.min(1, RELAJACION_MEZCLA * dt)
  for (const p of ps) {
    if (p.fase === 0) {
      if (p.espera > 0) {
        p.espera -= dt * fEntrada
      } else {
        p.y -= VELOCIDAD_CAIDA * fEntrada * dt
        if (p.y <= agua) {
          p.y = agua
          empezarMezcla(p, f, azar)
        }
      }
    } else if (p.fase === 1) {
      p.theta += p.omega * dt
      p.r += (p.rObjetivo - p.r) * acercar
      p.y += (p.alturaRelativa * agua - p.y) * acercar
      p.x = p.r * Math.cos(p.theta)
      p.z = p.r * Math.sin(p.theta)
      p.resta -= dt
      if (p.resta <= 0) p.fase = 2
    } else {
      const dx = f.radioInterior - p.x
      // Si el nivel está bajo el eje de la salida, apunta a la superficie para no quedarse pegada.
      const dy = Math.min(f.alturaSalida, agua) - p.y
      const dz = -p.z
      const distancia = Math.hypot(dx, dy, dz)
      const paso = VELOCIDAD_SALIDA_PARTICULA * fSalida * dt
      if (distancia - paso <= LLEGADA_SALIDA) {
        if (paso > 0) soltarEnIngreso(p, f, azar)
      } else {
        p.x += (dx / distancia) * paso
        p.y += (dy / distancia) * paso
        p.z += (dz / distancia) * paso
      }
    }
    if (p.fase !== 0 && p.y > agua) p.y = agua
  }
}

/** Escribe x, y, z y visible (1/0) de cada partícula en `salida`. Las del agua se ocultan si el tanque está vacío. */
export function escribirPosiciones(ps: Particula[], nivel: number, salida: Float32Array): void {
  const hayAgua = nivel >= NIVEL_MINIMO_VISIBLE
  ps.forEach((p, i) => {
    const o = i * 4
    salida[o] = p.x
    salida[o + 1] = p.y
    salida[o + 2] = p.z
    salida[o + 3] = (p.fase === 0 ? p.espera <= 0 : hayAgua) ? 1 : 0
  })
}
