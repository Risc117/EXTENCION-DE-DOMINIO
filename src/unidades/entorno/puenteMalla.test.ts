import { describe, expect, it } from 'vitest'
import { ELEVACION_RIO, ELEVACION_VIA, PUENTE_ESTACIONES } from '../../nucleo/constantesEntorno'
import { puente as datos } from './datosPuente'
import { entorno } from './datos'
import { calcularPuente } from './cruceCamino'
import { cotaTablero, mallaTablero, postesBaranda, estaciones } from './puenteMalla'
import { alturaNivelada } from './terrenoNivelado'

/** Junto a cada orilla (m) no se exige holgura: ahí el agua apenas empieza. */
const MARGEN_ORILLA = 0.5
const g = calcularPuente(entorno.camino, entorno.rio, datos.extensionSobreOrilla.valor)

describe('datos del puente', () => {
  it('son Dato de ejemplo, dicen que es una interpretación y el esquema los valida', () => {
    for (const m of [datos.espesorTablero, datos.joroba, datos.alturaBaranda, datos.separacionPostes, datos.ladoPoste, datos.extensionSobreOrilla, datos.largoEstribo, datos.profundidadEstribo, datos.holguraSobreAgua]) {
      expect(m.demo).toBe(true)
      expect(m.fuente).toContain('No está en las fuentes')
    }
    expect(datos.fuente).toMatch(/interpretación/i)
    expect(datos.fuente).toContain('no dibuja')
  })
})

describe('cota del tablero', () => {
  it('en los extremos es la cota del camino y en el medio sube (la joroba)', () => {
    expect(cotaTablero(0, 10, 8, 1.2)).toBeCloseTo(10, 9)
    expect(cotaTablero(1, 10, 8, 1.2)).toBeCloseTo(8, 9)
    expect(cotaTablero(0.5, 10, 8, 1.2)).toBeCloseTo(9 + 1.2, 9)
  })
  it('sin joroba es una rampa recta', () => {
    expect(cotaTablero(0.25, 10, 8, 0)).toBeCloseTo(9.5, 9)
  })
})

describe('malla del tablero', () => {
  const cotas = [1, 1.2, 1.4]
  const m = mallaTablero({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 1 }, 4, cotas, 0.25)
  it('4 vértices por estación y 24 índices por tramo más 12 de las tapas', () => {
    expect(m.posiciones.length / 3).toBe(12)
    expect(m.indices.length).toBe(24 * 2 + 12)
  })
  it('la cara de arriba está a la cota de cada estación y la de abajo un espesor más abajo; usa x, y = cota, z = −y', () => {
    const y = (i: number) => m.posiciones[i * 3 + 1]
    expect(y(0)).toBeCloseTo(1, 9)
    expect(y(2)).toBeCloseTo(1 - 0.25, 9)
    expect(y(4)).toBeCloseTo(1.2, 9)
    const [x0, , z0] = [m.posiciones[0], m.posiciones[1], m.posiciones[2]]
    expect(x0).toBeCloseTo(0, 9)
    expect(z0).toBeCloseTo(-2, 9)
  })
  it('el ancho es el pedido, centrado en el eje', () => {
    const zs = Array.from({ length: 4 }, (_, i) => m.posiciones[i * 3 + 2])
    expect(Math.max(...zs) - Math.min(...zs)).toBeCloseTo(4, 9)
  })
  it('el frente de cada cara mira hacia afuera de la caja (arriba hacia +y, abajo hacia −y, costados y tapas hacia afuera)', () => {
    const v = (i: number) => [m.posiciones[i * 3], m.posiciones[i * 3 + 1], m.posiciones[i * 3 + 2]]
    const n = m.posiciones.length / 3
    const centro = [0, 1, 2].map((k) => Array.from({ length: n }, (_, i) => v(i)[k]).reduce((s, x) => s + x, 0) / n)
    for (let t = 0; t < m.indices.length; t += 3) {
      const [a, b, c] = [v(m.indices[t]), v(m.indices[t + 1]), v(m.indices[t + 2])]
      const [u, w] = [[b[0] - a[0], b[1] - a[1], b[2] - a[2]], [c[0] - a[0], c[1] - a[1], c[2] - a[2]]]
      const normal = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]
      const medio = [(a[0] + b[0] + c[0]) / 3 - centro[0], (a[1] + b[1] + c[1]) / 3 - centro[1], (a[2] + b[2] + c[2]) / 3 - centro[2]]
      expect(normal[0] * medio[0] + normal[1] * medio[1] + normal[2] * medio[2], `triángulo ${t / 3}`).toBeGreaterThan(0)
    }
    // La cara de arriba (primer triángulo) mira hacia +y.
    const [a, b, c] = [v(m.indices[0]), v(m.indices[1]), v(m.indices[2])]
    const [u, w] = [[b[0] - a[0], b[1] - a[1], b[2] - a[2]], [c[0] - a[0], c[1] - a[1], c[2] - a[2]]]
    expect(u[2] * w[0] - u[0] * w[2]).toBeGreaterThan(0)
  })
  it('todos los índices apuntan a vértices que existen', () => {
    expect(Math.max(...m.indices)).toBeLessThan(m.posiciones.length / 3)
    expect(Math.min(...m.indices)).toBeGreaterThanOrEqual(0)
  })
})

describe('postes de la baranda', () => {
  it('hay postes en ambos lados desde el inicio hasta el fin, a la separación pedida o menos', () => {
    const p = postesBaranda({ x: 0, y: 0 }, { x: 10, y: 0 }, 1.5)
    expect(p.filter((q) => q.lado === 1)).toHaveLength(p.filter((q) => q.lado === -1).length)
    const t = p.filter((q) => q.lado === 1).map((q) => q.t)
    expect(t[0]).toBe(0)
    expect(t[t.length - 1]).toBe(1)
    for (let i = 1; i < t.length; i++) expect((t[i] - t[i - 1]) * 10).toBeLessThanOrEqual(1.5 + 1e-9)
  })
})

describe('el tablero con el terreno real', () => {
  const ref = 0
  const n = PUENTE_ESTACIONES
  const est = estaciones(g.inicio, g.fin, n)
  const cota = (x: number, y: number) => alturaNivelada(x, y) - ref + ELEVACION_VIA
  const [ci, cf] = [cota(g.inicio.x, g.inicio.y), cota(g.fin.x, g.fin.y)]
  const cotas = est.map((e) => cotaTablero(e.t, ci, cf, datos.joroba.valor))
  it('en ambos extremos queda a la cota del camino (terreno + elevación de la vía)', () => {
    expect(cotas[0]).toBeCloseTo(ci, 9)
    expect(cotas[n]).toBeCloseTo(cf, 9)
  })
  it('sobre el agua: el fondo del tablero queda más alto que la superficie del río (con la holgura) en la parte entre orillas, salvo 0.5 m junto a cada orilla (donde el agua empieza)', () => {
    const margen = MARGEN_ORILLA / g.largoTotal
    const tA = datos.extensionSobreOrilla.valor / g.largoTotal
    for (let i = 0; i <= n; i++) {
      const { t, x, y } = est[i]
      if (t < tA + margen || t > 1 - tA - margen) continue
      const agua = alturaNivelada(x, y) - ref + ELEVACION_RIO
      expect(cotas[i] - datos.espesorTablero.valor - agua, `t = ${t.toFixed(2)}`).toBeGreaterThanOrEqual(datos.holguraSobreAgua.valor)
    }
  })
})
