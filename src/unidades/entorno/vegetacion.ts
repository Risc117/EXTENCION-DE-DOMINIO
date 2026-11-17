import { azar } from '../../nucleo/azar'
import { distanciaAPolilinea } from './cruceCamino'
import { entorno } from './datos'
import type { DatosVegetacion } from './datosVegetacion'
import { alturaNivelada } from './terrenoNivelado'

interface P {
  x: number
  y: number
}

/** Dónde puede haber vegetación: fuera del cerco, del río y del camino (con márgenes) y sobre el terreno. */
export interface Restricciones {
  /** Anillo del cerco (se cierra solo). */
  cerco: P[]
  margenCerco: number
  /** Polígono del cauce del río y sus dos orillas. */
  cauce: P[]
  orillas: P[][]
  margenRio: number
  bordesCamino: P[][]
  margenCamino: number
  region: { x0: number; x1: number; y0: number; y1: number }
  /** Altura del terreno; −Infinito donde no hay terreno. */
  alturaSuelo: (x: number, y: number) => number
}

export interface Planta extends P {
  /** Giro (rad) y escala relativa. */
  giro: number
  escala: number
}

/** Cantidad de intentos por planta antes de rendirse (si no hay lugar, devuelve las que cupieron). */
const INTENTOS_POR_PLANTA = 60
const DOS_PI = 2 * Math.PI

/** true si el punto está dentro del polígono (se cierra solo). */
export function enPoligono(p: P, poligono: P[]): boolean {
  let dentro = false
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const [a, b] = [poligono[i], poligono[j]]
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) dentro = !dentro
  }
  return dentro
}

/** El anillo del cerco: sus trazos uno tras otro (el portón queda como un hueco entre ellos; el anillo se cierra solo). */
export const cercoCerrado = (trazos: readonly P[][]): P[] => trazos.flat()

function valido(p: P, r: Restricciones): boolean {
  if (!Number.isFinite(r.alturaSuelo(p.x, p.y))) return false
  if (enPoligono(p, r.cerco) || distanciaAPolilinea(p, [...r.cerco, r.cerco[0]]) < r.margenCerco) return false
  if (enPoligono(p, r.cauce) || r.orillas.some((o) => distanciaAPolilinea(p, o) < r.margenRio)) return false
  return !r.bordesCamino.some((b) => distanciaAPolilinea(p, b) < r.margenCamino)
}

/**
 * Reparte `n` plantas al azar con una semilla (siempre salen las mismas y las primeras no cambian con `n`): solo donde se puede (ver Restricciones).
 * Si no hay lugar para todas, devuelve las que cupieron.
 */
export function repartirVegetacion(r: Restricciones, n: number, semilla: number, variacion = { minima: 0.7, maxima: 1.3 }): Planta[] {
  const sorteo = azar(semilla)
  const { x0, x1, y0, y1 } = r.region
  const lista: Planta[] = []
  for (let intento = 0; lista.length < n && intento < n * INTENTOS_POR_PLANTA; intento++) {
    const p = { x: x0 + sorteo() * (x1 - x0), y: y0 + sorteo() * (y1 - y0) }
    const giro = sorteo() * DOS_PI
    const escala = variacion.minima + sorteo() * (variacion.maxima - variacion.minima)
    if (valido(p, r)) lista.push({ ...p, giro, escala })
  }
  return lista
}

/** Las restricciones reales: el cerco, el río y el camino de datos/entorno.json y el terreno recortado, con los márgenes y el alcance de datos/vegetacion.json. */
export function restriccionesDeEntorno(d: DatosVegetacion): Restricciones {
  const cerco = cercoCerrado(entorno.cerco.trazos)
  const [xs, ys] = [cerco.map((p) => p.x), cerco.map((p) => p.y)]
  const a = d.alcance.valor
  return {
    cerco,
    margenCerco: d.margenCerco.valor,
    cauce: [...entorno.rio.margenesA.flat(), ...[...entorno.rio.margenB].reverse()],
    orillas: [...entorno.rio.margenesA, entorno.rio.margenB],
    margenRio: d.margenRio.valor,
    bordesCamino: [...entorno.camino.margenesA, entorno.camino.margenB],
    margenCamino: d.margenCamino.valor,
    region: { x0: Math.min(...xs) - a, x1: Math.max(...xs) + a, y0: Math.min(...ys) - a, y1: Math.max(...ys) + a },
    alturaSuelo: alturaNivelada,
  }
}
