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

/** Pared vertical bajo el contorno de la malla (borde limpio): baja `profundidad` m bajo la cota más baja del borde. */
export function faldonTerreno(g: Cuadricula, referencia: number, profundidad: number): DatosGeometria {
  const anillo: [number, number][] = []
  for (let c = 0; c < g.columnas; c++) anillo.push([c, 0])
  for (let f = 1; f < g.filas; f++) anillo.push([g.columnas - 1, f])
  for (let c = g.columnas - 2; c >= 0; c--) anillo.push([c, g.filas - 1])
  for (let f = g.filas - 2; f >= 1; f--) anillo.push([0, f])
  const cotaNodo = ([c, f]: [number, number]) => g.cotas[f * g.columnas + c]
  const fondo = Math.min(...anillo.map(cotaNodo)) - profundidad
  const posiciones = new Float32Array(anillo.length * 6)
  const cotas = new Float32Array(anillo.length * 2).fill(fondo)
  anillo.forEach(([c, f], i) => {
    const [x, z] = [g.x0 + c * g.paso, -(g.y0 + f * g.paso)]
    posiciones.set([x, cotaNodo([c, f]) - referencia, z, x, fondo - referencia, z], i * 6)
    cotas[2 * i] = cotaNodo([c, f])
  })
  const indices = new Uint32Array(anillo.length * 6)
  anillo.forEach((_, i) => {
    const [a, b] = [2 * i, 2 * ((i + 1) % anillo.length)]
    indices.set([a, a + 1, b, b, a + 1, b + 1], i * 6)
  })
  return { posiciones, indices, cotas }
}

/** Fracción 0 a 1 de una cota entre la más baja y la más alta del terreno. */
export function fraccionAltura(cota: number, minimo: number, maximo: number): number {
  return maximo === minimo ? 0 : (cota - minimo) / (maximo - minimo)
}
