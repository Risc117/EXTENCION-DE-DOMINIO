import type { Cuadricula } from './altura'

/** Caja (m locales) del terreno que se dibuja. */
export interface Ventana {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

type Punto = [number, number]

/** La caja que envuelve los puntos, con `margen` metros más por cada lado. */
export function ventanaDe(puntos: Punto[], margen: number): Ventana {
  const [xs, ys] = [puntos.map((p) => p[0]), puntos.map((p) => p[1])]
  return { xMin: Math.min(...xs) - margen, xMax: Math.max(...xs) + margen, yMin: Math.min(...ys) - margen, yMax: Math.max(...ys) + margen }
}

/** Parte de la malla que cubre la ventana, en nodos enteros (nunca más allá de la malla, y al menos 2 × 2 nodos). */
export function recortarCuadricula(g: Cuadricula, v: Ventana): Cuadricula {
  const limite = (valor: number, origen: number, n: number, redondear: (x: number) => number) => Math.min(n - 1, Math.max(0, redondear((valor - origen) / g.paso)))
  let [c0, c1] = [limite(v.xMin, g.x0, g.columnas, Math.floor), limite(v.xMax, g.x0, g.columnas, Math.ceil)]
  let [f0, f1] = [limite(v.yMin, g.y0, g.filas, Math.floor), limite(v.yMax, g.y0, g.filas, Math.ceil)]
  if (c1 - c0 < 1) [c0, c1] = c0 > 0 ? [c0 - 1, c0] : [0, 1]
  if (f1 - f0 < 1) [f0, f1] = f0 > 0 ? [f0 - 1, f0] : [0, 1]
  const cotas: number[] = []
  for (let f = f0; f <= f1; f++) for (let c = c0; c <= c1; c++) cotas.push(g.cotas[f * g.columnas + c])
  return { x0: g.x0 + c0 * g.paso, y0: g.y0 + f0 * g.paso, paso: g.paso, columnas: c1 - c0 + 1, filas: f1 - f0 + 1, cotas }
}

/** El trozo de la línea a-b que cae dentro de la ventana (Liang-Barsky); null si no toca. */
export function recortarSegmento(a: Punto, b: Punto, v: Ventana): [Punto, Punto] | null {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]]
  let [t0, t1] = [0, 1]
  for (const [p, q] of [[-dx, a[0] - v.xMin], [dx, v.xMax - a[0]], [-dy, a[1] - v.yMin], [dy, v.yMax - a[1]]] as const) {
    if (p === 0) {
      if (q < 0) return null
    } else {
      const r = q / p
      if (p < 0) t0 = Math.max(t0, r)
      else t1 = Math.min(t1, r)
      if (t0 > t1) return null
    }
  }
  return [[a[0] + dx * t0, a[1] + dy * t0], [a[0] + dx * t1, a[1] + dy * t1]]
}
