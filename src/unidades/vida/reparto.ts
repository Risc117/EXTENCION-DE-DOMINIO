import { azar } from '../../nucleo/azar'

export interface Punto {
  x: number
  y: number
}

/** Posición en el plano (x este, y norte, m) y rumbo (rad, ángulo del plano) de un animal. */
export interface Pose extends Punto {
  rumbo: number
}

/** Una hoja de pasto: posición, giro (rad) y escala (1 = altura de datos). */
export interface Hoja extends Punto {
  giro: number
  escala: number
}

const FACTOR_ESCALA_MIN = 0.6
const FACTOR_ESCALA_VARIACION = 0.8
const DOS_PI = 2 * Math.PI

/** Punto más cercano de `p` en varias polilíneas. */
function masCercano(p: Punto, lineas: Punto[][]): { punto: Punto; distancia: number } {
  let mejor = { punto: lineas[0][0], distancia: Number.POSITIVE_INFINITY }
  for (const l of lineas) {
    for (let i = 1; i < l.length; i++) {
      const [dx, dy] = [l[i].x - l[i - 1].x, l[i].y - l[i - 1].y]
      const largo2 = dx * dx + dy * dy
      const f = largo2 === 0 ? 0 : Math.min(1, Math.max(0, ((p.x - l[i - 1].x) * dx + (p.y - l[i - 1].y) * dy) / largo2))
      const punto = { x: l[i - 1].x + dx * f, y: l[i - 1].y + dy * f }
      const distancia = Math.hypot(p.x - punto.x, p.y - punto.y)
      if (distancia < mejor.distancia) mejor = { punto, distancia }
    }
  }
  return mejor
}

/** Largos acumulados de una polilínea (el primero es 0). */
function acumulados(ruta: Punto[]): number[] {
  const a = [0]
  for (let i = 1; i < ruta.length; i++) a.push(a[i - 1] + Math.hypot(ruta[i].x - ruta[i - 1].x, ruta[i].y - ruta[i - 1].y))
  return a
}

/** Punto a la distancia `d` a lo largo de la polilínea y rumbo del tramo (hacia delante). */
function sobreRuta(ruta: Punto[], acum: number[], d: number): Pose {
  let i = 1
  while (i < ruta.length - 1 && acum[i] < d) i++
  const [a, b] = [ruta[i - 1], ruta[i]]
  const f = (d - acum[i - 1]) / (acum[i] - acum[i - 1] || 1)
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, rumbo: Math.atan2(b.y - a.y, b.x - a.x) }
}

/**
 * Reparte `n` hojas de pasto entre la franja verde y el cerco: a lo largo de la franja, hacia el cerco,
 * hasta `ancho` m (sin pasar del cerco). Con la misma semilla sale siempre lo mismo y las primeras hojas no cambian con `n`.
 */
export function repartirPasto(franja: Punto[], cerco: Punto[][], n: number, ancho: number, semilla: number): Hoja[] {
  const acum = acumulados(franja)
  const largo = acum[acum.length - 1]
  const sorteo = azar(semilla)
  return Array.from({ length: n }, () => {
    const base = sobreRuta(franja, acum, sorteo() * largo)
    const { punto, distancia } = masCercano(base, cerco)
    const salto = Math.min(ancho, distancia) * sorteo()
    const f = distancia === 0 ? 0 : salto / distancia
    return {
      x: base.x + (punto.x - base.x) * f,
      y: base.y + (punto.y - base.y) * f,
      giro: sorteo() * DOS_PI,
      escala: FACTOR_ESCALA_MIN + FACTOR_ESCALA_VARIACION * sorteo(),
    }
  })
}

/** Animal que va y vuelve por una polilínea a `velocidad` m/s; `fase` (0 a 1) lo adelanta en el recorrido de ida y vuelta. */
export function posicionEnRuta(ruta: Punto[], velocidad: number, t: number, fase: number): Pose {
  const acum = acumulados(ruta)
  const largo = acum[acum.length - 1]
  const recorrido = (((velocidad * t + fase * 2 * largo) % (2 * largo)) + 2 * largo) % (2 * largo)
  if (recorrido <= largo) return sobreRuta(ruta, acum, recorrido)
  const p = sobreRuta(ruta, acum, 2 * largo - recorrido)
  return { ...p, rumbo: p.rumbo + Math.PI }
}

/** Animal que da vueltas en círculo (sentido antihorario en el plano) a `velocidad` m/s; `fase` (0 a 1) lo adelanta en la vuelta. */
export function posicionEnCirculo(centro: Punto, radio: number, velocidad: number, t: number, fase: number): Pose {
  const a = (velocidad * t) / radio + fase * DOS_PI
  return { x: centro.x + radio * Math.cos(a), y: centro.y + radio * Math.sin(a), rumbo: a + Math.PI / 2 }
}
