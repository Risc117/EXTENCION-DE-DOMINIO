import { estaciones, type MallaPlana } from './geometria'
import type { PuntoPlano } from './esquema'

type TerrenoEn = (x: number, y: number) => number

/** Malla de una franja: posiciones, índices y coordenadas de textura (u a lo largo, v de una orilla a la otra). */
export interface MallaFranja extends MallaPlana {
  uv: number[]
}

/** Punto más cercano a `p` entre varias polilíneas, y a qué distancia está. */
export function masCercano(p: PuntoPlano, lineas: PuntoPlano[][]): { punto: PuntoPlano; distancia: number } {
  let mejor = { punto: lineas[0][0], distancia: Number.POSITIVE_INFINITY }
  for (const l of lineas) {
    for (let i = 1; i < l.length; i++) {
      const [a, b] = [l[i - 1], l[i]]
      const [dx, dy] = [b.x - a.x, b.y - a.y]
      const largo2 = dx * dx + dy * dy
      const f = largo2 === 0 ? 0 : Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy) / largo2))
      const punto = { x: a.x + dx * f, y: a.y + dy * f }
      const distancia = Math.hypot(p.x - punto.x, p.y - punto.y)
      if (distancia < mejor.distancia) mejor = { punto, distancia }
    }
  }
  return mejor
}

/**
 * Cinta apoyada en el terreno entre dos orillas: cada punto de la orilla B (cada `paso` m) se une con el punto más cercano de las orillas A,
 * así la franja sigue los bordes reales del dibujo y su ancho puede variar. Se corta donde se acaba el terreno levantado.
 * Los puntos sin orilla A a menos de `distanciaMax` se saltan. u = metros recorridos / `largoPatron`.
 */
export function cintaEntreMargenes(a: PuntoPlano[][], b: PuntoPlano[], paso: number, terrenoEn: TerrenoEn, referencia: number, elevacion: number, largoPatron: number, distanciaMax: number): MallaFranja {
  const posiciones: number[] = []
  const indices: number[] = []
  const uv: number[] = []
  let recorrido = 0
  let anterior: PuntoPlano | null = null
  let n = 0
  for (const { p } of estaciones(b, paso)) {
    const c = masCercano(p, a)
    if (c.distancia > distanciaMax) continue
    const [za, zb] = [terrenoEn(c.punto.x, c.punto.y), terrenoEn(p.x, p.y)]
    if (!Number.isFinite(za) || !Number.isFinite(zb)) break
    if (anterior) recorrido += Math.hypot(p.x - anterior.x, p.y - anterior.y)
    anterior = p
    posiciones.push(c.punto.x, za - referencia + elevacion, -c.punto.y, p.x, zb - referencia + elevacion, -p.y)
    uv.push(recorrido / largoPatron, 0, recorrido / largoPatron, 1)
    if (n > 0) indices.push(2 * n - 2, 2 * n - 1, 2 * n, 2 * n - 1, 2 * n + 1, 2 * n)
    n++
  }
  return { posiciones, indices, uv }
}
