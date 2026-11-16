import type { Cuadricula } from '../../nucleo/terreno'

export interface DatosGeometria {
  /** x, y, z de cada vértice en la escena (x este, y arriba, z sur). */
  posiciones: Float32Array
  /** Triángulos. */
  indices: Uint32Array
  /** Cota (m s.n.m.) de cada vértice, para colorear por altura. */
  cotas: Float32Array
}

/** Malla del terreno: un vértice por nodo de la cuadrícula y dos triángulos por celda. */
export function geometriaTerreno(g: Cuadricula, referencia: number): DatosGeometria {
  const n = g.columnas * g.filas
  const posiciones = new Float32Array(n * 3)
  const cotas = new Float32Array(n)
  for (let f = 0; f < g.filas; f++) {
    for (let c = 0; c < g.columnas; c++) {
      const i = f * g.columnas + c
      const cota = g.cotas[i]
      posiciones.set([g.x0 + c * g.paso, cota - referencia, -(g.y0 + f * g.paso)], i * 3)
      cotas[i] = cota
    }
  }
  const indices = new Uint32Array((g.columnas - 1) * (g.filas - 1) * 6)
  let k = 0
  for (let f = 0; f < g.filas - 1; f++) {
    for (let c = 0; c < g.columnas - 1; c++) {
      const a = f * g.columnas + c
      const [b, d, e] = [a + 1, a + g.columnas, a + g.columnas + 1]
      // Visto desde arriba (y hacia arriba, z al sur) el orden a-b-d queda hacia arriba.
      indices.set([a, b, d, b, e, d], k)
      k += 6
    }
  }
  return { posiciones, indices, cotas }
}

/** Fracción 0 a 1 de una cota entre la más baja y la más alta del terreno. */
export function fraccionAltura(cota: number, minimo: number, maximo: number): number {
  return maximo === minimo ? 0 : (cota - minimo) / (maximo - minimo)
}
