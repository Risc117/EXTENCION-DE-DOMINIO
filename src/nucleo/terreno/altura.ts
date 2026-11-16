import type { DatosTerreno } from './esquema'

/** Cuadrícula de cotas absolutas (m s.n.m.), de oeste a este y de sur a norte. */
export interface Cuadricula {
  x0: number
  y0: number
  paso: number
  columnas: number
  filas: number
  cotas: number[]
}

/** Pasa la malla del JSON a cotas absolutas, tomando un nodo cada `salto` (1 = todos). */
export function cuadricula(t: DatosTerreno, salto = 1): Cuadricula {
  const m = t.malla
  const columnas = Math.floor((m.columnas - 1) / salto) + 1
  const filas = Math.floor((m.filas - 1) / salto) + 1
  const cotas: number[] = []
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) cotas.push(t.cotaBase.valor + m.alturas[f * salto * m.columnas + c * salto])
  }
  return { x0: m.x0, y0: m.y0, paso: m.paso * salto, columnas, filas, cotas }
}

/** Cota del terreno en (x, y) en metros locales; null fuera de la malla. Interpolación bilineal. */
export function alturaEn(g: Cuadricula, x: number, y: number): number | null {
  const fx = (x - g.x0) / g.paso
  const fy = (y - g.y0) / g.paso
  if (fx < 0 || fy < 0 || fx > g.columnas - 1 || fy > g.filas - 1) return null
  const i = Math.min(Math.floor(fx), g.columnas - 2)
  const j = Math.min(Math.floor(fy), g.filas - 2)
  const [tx, ty] = [fx - i, fy - j]
  const h = (c: number, f: number) => g.cotas[f * g.columnas + c]
  return h(i, j) * (1 - tx) * (1 - ty) + h(i + 1, j) * tx * (1 - ty) + h(i, j + 1) * (1 - tx) * ty + h(i + 1, j + 1) * tx * ty
}
