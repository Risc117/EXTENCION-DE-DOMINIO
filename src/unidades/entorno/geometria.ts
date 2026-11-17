import { ELEVACION_VIA } from '../../nucleo/constantesEntorno'
import type { Vec3 } from '../comun/tiposAnotaciones'
import type { PuntoPlano } from './esquema'

type TerrenoEn = (x: number, y: number) => number

/** Malla lista para BufferGeometry: posiciones x, y, z seguidas e índices de triángulos. */
export interface MallaPlana {
  posiciones: number[]
  indices: number[]
}

/** Cota más baja (base) y más alta (piso) del terreno bajo los vértices y el centro de un polígono. */
export function cotasBase(poligono: PuntoPlano[], terrenoEn: TerrenoEn): { base: number; piso: number } {
  const centro = { x: poligono.reduce((s, p) => s + p.x, 0) / poligono.length, y: poligono.reduce((s, p) => s + p.y, 0) / poligono.length }
  const cotas = [...poligono, centro].map((p) => terrenoEn(p.x, p.y))
  return { base: Math.min(...cotas), piso: Math.max(...cotas) }
}

/** Puntos del eje cada `paso` metros (y en cada vértice), con la dirección de la línea en cada uno. */
export function estaciones(eje: PuntoPlano[], paso: number): { p: PuntoPlano; t: PuntoPlano }[] {
  const salida: { p: PuntoPlano; t: PuntoPlano }[] = []
  for (let i = 1; i < eje.length; i++) {
    const [a, b] = [eje[i - 1], eje[i]]
    const largo = Math.hypot(b.x - a.x, b.y - a.y)
    const n = Math.max(1, Math.ceil(largo / paso))
    const t = { x: (b.x - a.x) / largo, y: (b.y - a.y) / largo }
    for (let k = i === 1 ? 0 : 1; k <= n; k++) salida.push({ p: { x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n }, t })
  }
  return salida
}

/** Cinta de ancho `ancho` centrada en el eje, apoyada sobre el terreno (un poco más arriba). Escena: x este, y arriba, z sur. */
export function cintaVia(eje: PuntoPlano[], ancho: number, terrenoEn: TerrenoEn, referencia: number, paso: number): MallaPlana {
  const posiciones: number[] = []
  const indices: number[] = []
  const est = estaciones(eje, paso)
  est.forEach(({ p, t }, i) => {
    // Normal en el vértice: promedio de la dirección que llega y la que sale.
    const sig = est[Math.min(i + 1, est.length - 1)].t
    const [tx, ty] = [t.x + sig.x, t.y + sig.y]
    const l = Math.hypot(tx, ty) || 1
    const [nx, ny] = [-ty / l, tx / l]
    for (const lado of [1, -1]) {
      const [x, y] = [p.x + nx * lado * (ancho / 2), p.y + ny * lado * (ancho / 2)]
      posiciones.push(x, terrenoEn(x, y) - referencia + ELEVACION_VIA, -y)
    }
    if (i > 0) indices.push(2 * i - 2, 2 * i - 1, 2 * i, 2 * i - 1, 2 * i + 1, 2 * i)
  })
  return { posiciones, indices }
}

/** Pared vertical a lo largo de un trazo: la base sigue el terreno y el borde alto queda `altura` metros más arriba. */
export function panelVertical(trazo: PuntoPlano[], altura: number, terrenoEn: TerrenoEn, referencia: number, paso: number): MallaPlana {
  const posiciones: number[] = []
  const indices: number[] = []
  estaciones(trazo, paso).forEach(({ p }, i) => {
    const suelo = terrenoEn(p.x, p.y) - referencia
    posiciones.push(p.x, suelo, -p.y, p.x, suelo + altura, -p.y)
    if (i > 0) indices.push(2 * i - 2, 2 * i, 2 * i - 1, 2 * i - 1, 2 * i, 2 * i + 1)
  })
  return { posiciones, indices }
}

/** Puntos de un círculo de `n` lados (el último repite el primero) apoyados en el terreno, para dibujar una línea. */
export function circuloSobreTerreno(centro: PuntoPlano, radio: number, n: number, terrenoEn: TerrenoEn, referencia: number, elevacion: number): Vec3[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((i % n) / n) * Math.PI * 2
    const [x, y] = [centro.x + Math.cos(a) * radio, centro.y + Math.sin(a) * radio]
    return [x, terrenoEn(x, y) - referencia + elevacion, -y] as Vec3
  })
}
