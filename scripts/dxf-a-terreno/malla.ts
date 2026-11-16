import Delaunator from 'delaunator'
import type { CurvaUtm } from './leerCurvas.ts'

export interface Malla {
  /** Esquina suroeste (UTM) y tamaño de celda (m). */
  x0: number
  y0: number
  paso: number
  columnas: number
  filas: number
  /** Alturas en filas de sur a norte, cada fila de oeste a este. */
  alturas: number[]
}

/**
 * Reparte las alturas de las curvas de nivel en una cuadrícula regular:
 * triangula todos los vértices (Delaunay) y en cada nodo toma la altura del triángulo que lo contiene.
 * Fuera del contorno de las curvas se copia la altura del nodo cargado más cercano.
 */
export function crearMalla(curvas: CurvaUtm[], paso: number): Malla {
  const puntos = curvas.flatMap((c) => densificar(c.puntos, paso / 2).map((p) => ({ x: p[0], y: p[1], z: c.cota })))
  const limites = puntos.reduce((l, p) => ({ x0: Math.min(l.x0, p.x), x1: Math.max(l.x1, p.x), y0: Math.min(l.y0, p.y), y1: Math.max(l.y1, p.y) }), { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity })
  const x0 = Math.floor(limites.x0 / paso) * paso
  const y0 = Math.floor(limites.y0 / paso) * paso
  const columnas = Math.ceil((limites.x1 - x0) / paso) + 1
  const filas = Math.ceil((limites.y1 - y0) / paso) + 1
  const alturas = new Array<number>(columnas * filas).fill(NaN)
  const t = new Delaunator(Float64Array.from(puntos.flatMap((p) => [p.x, p.y]))).triangles
  for (let i = 0; i < t.length; i += 3) {
    const [a, b, c] = [puntos[t[i]], puntos[t[i + 1]], puntos[t[i + 2]]]
    const det = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y)
    if (det === 0) continue
    const [ci0, ci1] = [Math.ceil((Math.min(a.x, b.x, c.x) - x0) / paso), Math.floor((Math.max(a.x, b.x, c.x) - x0) / paso)]
    const [fi0, fi1] = [Math.ceil((Math.min(a.y, b.y, c.y) - y0) / paso), Math.floor((Math.max(a.y, b.y, c.y) - y0) / paso)]
    for (let f = fi0; f <= fi1; f++) {
      for (let col = ci0; col <= ci1; col++) {
        const x = x0 + col * paso
        const y = y0 + f * paso
        const l1 = ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) / det
        const l2 = ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) / det
        const l3 = 1 - l1 - l2
        if (l1 < -1e-9 || l2 < -1e-9 || l3 < -1e-9) continue
        alturas[f * columnas + col] = l1 * a.z + l2 * b.z + l3 * c.z
      }
    }
  }
  rellenarHuecos(alturas, columnas, filas)
  return { x0, y0, paso, columnas, filas, alturas }
}

/** Agrega vértices intermedios para que ningún segmento supere `maximo` metros: así la triangulación respeta la curva. */
export function densificar(puntos: [number, number][], maximo: number): [number, number][] {
  const salida: [number, number][] = []
  puntos.forEach((p, i) => {
    if (i > 0) {
      const a = puntos[i - 1]
      const n = Math.ceil(Math.hypot(p[0] - a[0], p[1] - a[1]) / maximo)
      for (let k = 1; k < n; k++) salida.push([a[0] + ((p[0] - a[0]) * k) / n, a[1] + ((p[1] - a[1]) * k) / n])
    }
    salida.push(p)
  })
  return salida
}

/** Los nodos sin dato toman el valor de un vecino ya cargado, capa por capa hacia afuera. */
function rellenarHuecos(alturas: number[], columnas: number, filas: number): void {
  let faltan = alturas.some(Number.isNaN)
  while (faltan) {
    const copia = alturas.slice()
    faltan = false
    for (let f = 0; f < filas; f++) {
      for (let c = 0; c < columnas; c++) {
        if (!Number.isNaN(copia[f * columnas + c])) continue
        const vecinos = [[c - 1, f], [c + 1, f], [c, f - 1], [c, f + 1]]
          .filter(([x, y]) => x >= 0 && x < columnas && y >= 0 && y < filas)
          .map(([x, y]) => copia[y * columnas + x])
          .filter((v) => !Number.isNaN(v))
        if (vecinos.length > 0) alturas[f * columnas + c] = vecinos.reduce((s, v) => s + v, 0) / vecinos.length
        else faltan = true
      }
    }
  }
}
