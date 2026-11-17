interface P {
  x: number
  y: number
}

/** Cota del tablero en el punto `t` (0 en el inicio, 1 en el fin): rampa entre las cotas del camino de cada lado más una joroba en el medio (sube `joroba` m en el centro). */
export const cotaTablero = (t: number, cotaInicio: number, cotaFin: number, joroba: number): number => cotaInicio + (cotaFin - cotaInicio) * t + joroba * 4 * t * (1 - t)

/** `n + 1` puntos repartidos del inicio al fin del tablero (plano x, y) con su posición relativa `t`. */
export function estaciones(inicio: P, fin: P, n: number): { t: number; x: number; y: number }[] {
  return Array.from({ length: n + 1 }, (_, i) => ({ t: i / n, x: inicio.x + (fin.x - inicio.x) * (i / n), y: inicio.y + (fin.y - inicio.y) * (i / n) }))
}

export interface Malla {
  /** x, y, z de la escena (y = cota, z = −y del plano). */
  posiciones: number[]
  indices: number[]
}

/**
 * Tablero como una caja que sigue las `cotas` (una por estación): 4 vértices por estación (arriba izquierda y derecha, abajo izquierda y derecha),
 * cara de arriba, de abajo, dos costados y dos tapas. `normal` es la dirección unitaria perpendicular al eje (plano) y `ancho` el ancho total.
 */
export function mallaTablero(inicio: P, fin: P, normal: P, ancho: number, cotas: number[], espesor: number): Malla {
  const n = cotas.length - 1
  const posiciones: number[] = []
  for (const e of estaciones(inicio, fin, n)) {
    const cota = cotas[Math.round(e.t * n)]
    for (const [lado, y] of [[1, cota], [-1, cota], [1, cota - espesor], [-1, cota - espesor]] as const) {
      posiciones.push(e.x + normal.x * lado * (ancho / 2), y, -(e.y + normal.y * lado * (ancho / 2)))
    }
  }
  const indices: number[] = []
  // Los vértices de cada cara se dan en el orden que deja su frente hacia afuera de la caja (regla de la mano derecha).
  const cuadro = (a: number, b: number, c: number, d: number) => indices.push(a, c, b, a, d, c)
  for (let i = 0; i < n; i++) {
    const [a, b] = [i * 4, (i + 1) * 4]
    cuadro(a, b, b + 1, a + 1) // arriba
    cuadro(a + 3, b + 3, b + 2, a + 2) // abajo
    cuadro(a, a + 2, b + 2, b) // costado izquierdo
    cuadro(a + 1, b + 1, b + 3, a + 3) // costado derecho
  }
  cuadro(0, 1, 3, 2) // tapa del inicio
  const u = n * 4
  cuadro(u, u + 2, u + 3, u + 1) // tapa del fin
  return { posiciones, indices }
}

export interface PosteBaranda {
  /** Posición relativa (0 a 1) a lo largo del tablero. */
  t: number
  /** 1 = lado de la normal; −1 = el opuesto. */
  lado: 1 | -1
}

/** Postes de la baranda en ambos lados, desde el inicio hasta el fin, a una separación igual y no mayor que `separacion` m. */
export function postesBaranda(inicio: P, fin: P, separacion: number): PosteBaranda[] {
  const largo = Math.hypot(fin.x - inicio.x, fin.y - inicio.y)
  const tramos = Math.max(1, Math.ceil(largo / separacion))
  return ([1, -1] as const).flatMap((lado) => Array.from({ length: tramos + 1 }, (_, i) => ({ t: i / tramos, lado })))
}
