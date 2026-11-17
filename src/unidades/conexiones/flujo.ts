import {
  FRACCION_LENTA,
  SEPARACION_PERLAS,
  VELOCIDAD_MAXIMA,
  VELOCIDAD_MINIMA,
  VELOCIDAD_PROMEDIO,
} from '../../nucleo/constantesFlujoTuberias'
import type { Calidad } from '../../estado/preferenciaCalidad'
import type { Vec3 } from '../comun/tiposAnotaciones'
import type { TramoConexion } from './esquema'
import type { TuboCalculado } from './geometria'

/** Recorrido de un tramo: sus puntos en la escena, la distancia acumulada en cada uno y el largo total. */
export interface Ruta {
  id: string
  color: string
  radio: number
  caudal: TramoConexion['caudal']
  puntos: Vec3[]
  acumulado: number[]
  largo: number
}

const distancia3 = (a: Vec3, b: Vec3): number => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])

/** Una ruta por tubo, uniendo sus segmentos de principio a fin (sentido del flujo). */
export function construirRutas(tubos: TuboCalculado[], tramos: TramoConexion[]): Ruta[] {
  return tubos.map((t) => {
    const puntos: Vec3[] = [t.segmentos[0].a, ...t.segmentos.map((s) => s.b)]
    const acumulado = [0]
    for (let i = 1; i < puntos.length; i++) acumulado.push(acumulado[i - 1] + distancia3(puntos[i - 1], puntos[i]))
    return { id: t.id, color: t.color, radio: t.radio, caudal: tramos.find((x) => x.id === t.id)!.caudal, puntos, acumulado, largo: acumulado[acumulado.length - 1] }
  })
}

/** Punto de la ruta a una distancia del inicio; pasado el final o antes del inicio, da la vuelta. */
export function puntoEnRuta(r: Ruta, distancia: number): Vec3 {
  const d = ((distancia % r.largo) + r.largo) % r.largo
  let i = 1
  while (i < r.acumulado.length - 1 && r.acumulado[i] < d) i++
  const [a, b] = [r.puntos[i - 1], r.puntos[i]]
  const tramo = r.acumulado[i] - r.acumulado[i - 1]
  const f = tramo === 0 ? 0 : (d - r.acumulado[i - 1]) / tramo
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
}

/** Cuántas perlas lleva un tramo de ese largo (al menos una). */
export const cantidadPerlas = (largo: number, calidad: Calidad): number => Math.max(1, Math.floor(largo / SEPARACION_PERLAS[calidad]))

export interface CaudalesLinea {
  /** Caudal que entra a la planta y el que sale del homogeneizador (L/s). */
  entrada: number
  salida: number
  /** Caudal promedio del día elegido (L/s). */
  promedio: number
}

/** Velocidad visual (m/s de la escena) de las perlas de un tramo: proporcional a su caudal, con topes; 0 si no hay caudal. */
export function velocidadTramo(caudal: TramoConexion['caudal'], c: CaudalesLinea): number {
  if (caudal === 'lodo' || caudal === 'dosis' || caudal === 'drenaje') return VELOCIDAD_PROMEDIO * FRACCION_LENTA
  const q = caudal === 'entrada' ? c.entrada : caudal === 'salida' ? c.salida : c.salida / 2
  if (q <= 0 || c.promedio <= 0) return 0
  return Math.min(VELOCIDAD_MAXIMA, Math.max(VELOCIDAD_MINIMA, (VELOCIDAD_PROMEDIO * q) / c.promedio))
}
