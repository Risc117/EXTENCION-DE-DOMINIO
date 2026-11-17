import { describe, expect, it } from 'vitest'
import { entorno } from './datos'
import { calcularPuente, distanciaAPolilinea } from './cruceCamino'

type P = { x: number; y: number }
const camino = { margenesA: [[{ x: 0, y: 0 }, { x: 20, y: 0 }]], margenB: [{ x: 0, y: 4 }, { x: 20, y: 4 }] }
// Río vertical entre x = 8 y x = 14 (orillas A y B).
const rio = { margenesA: [[{ x: 8, y: -10 }, { x: 8, y: 10 }]], margenB: [{ x: 14, y: -10 }, { x: 14, y: 10 }] }

describe('puente donde el camino cruza el río (geometría)', () => {
  const p = calcularPuente(camino, rio, 1)
  it('el eje va de una orilla a la otra por el centro del camino', () => {
    expect(p.orillaA.x).toBeCloseTo(8, 9)
    expect(p.orillaA.y).toBeCloseTo(2, 9)
    expect(p.orillaB.x).toBeCloseTo(14, 9)
    expect(p.orillaB.y).toBeCloseTo(2, 9)
    expect(p.largoOrillas).toBeCloseTo(6, 9)
  })
  it('el ancho del tablero es el del camino', () => {
    expect(p.ancho).toBeCloseTo(4, 9)
  })
  it('el tablero sobresale de cada orilla la extensión pedida (apoya en tierra, sin hueco con el camino)', () => {
    expect(p.inicio.x).toBeCloseTo(7, 9)
    expect(p.fin.x).toBeCloseTo(15, 9)
    expect(p.largoTotal).toBeCloseTo(8, 9)
  })
  it('da la dirección y la normal unitarias', () => {
    expect(p.direccion).toEqual({ x: 1, y: 0 })
    expect(Math.hypot(p.normal.x, p.normal.y)).toBeCloseTo(1, 9)
    expect(p.direccion.x * p.normal.x + p.direccion.y * p.normal.y).toBeCloseTo(0, 9)
  })
  it('con un camino oblicuo el ancho se mide perpendicular al eje, no a lo largo del borde', () => {
    const oblicuo = { margenesA: [[{ x: 0, y: 0 }, { x: 20, y: 20 }]], margenB: [{ x: 0, y: 5 }, { x: 20, y: 25 }] }
    const r = { margenesA: [[{ x: 8, y: -10 }, { x: 8, y: 30 }]], margenB: [{ x: 14, y: -10 }, { x: 14, y: 30 }] }
    const q = calcularPuente(oblicuo, r, 0)
    expect(q.ancho).toBeCloseTo(5 / Math.SQRT2, 6)
  })
  it('sin cruce (el camino no toca el río) o con cruces repetidos falla con un mensaje claro', () => {
    expect(() => calcularPuente(camino, { margenesA: [[{ x: 100, y: -10 }, { x: 100, y: 10 }]], margenB: [{ x: 110, y: -10 }, { x: 110, y: 10 }] }, 1)).toThrow(/cruce/)
    const doble = { margenesA: [[{ x: 8, y: -10 }, { x: 8, y: 10 }, { x: 9, y: -10 }]], margenB: rio.margenB }
    expect(() => calcularPuente(camino, doble, 1)).toThrow(/cruce/)
  })
})

describe('puente con los datos reales del DXF', () => {
  const p = calcularPuente(entorno.camino, entorno.rio, 1)
  it('cruza el río cerca del portón, entre las dos orillas (unos 9 a 12 m) con el ancho del camino (3 a 6 m)', () => {
    expect(p.largoOrillas).toBeGreaterThan(7)
    expect(p.largoOrillas).toBeLessThan(13)
    expect(p.ancho).toBeGreaterThan(3)
    expect(p.ancho).toBeLessThan(6)
    expect(p.orillaA.x).toBeGreaterThan(10)
    expect(p.orillaA.x).toBeLessThan(30)
  })
  it('los dos extremos del tablero caen dentro del camino: entre sus dos bordes, a menos de medio ancho del centro', () => {
    for (const e of [p.inicio, p.fin]) {
      const bordes = [...entorno.camino.margenesA.map((l) => distanciaAPolilinea(e, l)), distanciaAPolilinea(e, entorno.camino.margenB)]
      const [dA, dB] = [Math.min(...bordes.slice(0, -1)), bordes[bordes.length - 1]]
      expect(Math.abs(dA - dB)).toBeLessThan(p.ancho / 2)
      expect(dA + dB).toBeLessThan(p.ancho * 1.5)
    }
  })
  it('el tablero cubre de orilla a orilla: cada orilla queda entre el inicio y el fin', () => {
    const t = (q: P) => (q.x - p.inicio.x) * p.direccion.x + (q.y - p.inicio.y) * p.direccion.y
    expect(t(p.orillaA)).toBeGreaterThan(0)
    expect(t(p.orillaB)).toBeLessThan(p.largoTotal)
    expect(t(p.orillaB) - t(p.orillaA)).toBeCloseTo(p.largoOrillas, 6)
  })
})

describe('distancia a una polilínea', () => {
  it('mide al punto más cercano de un tramo', () => {
    expect(distanciaAPolilinea({ x: 5, y: 3 }, [{ x: 0, y: 0 }, { x: 10, y: 0 }])).toBeCloseTo(3, 9)
    expect(distanciaAPolilinea({ x: 13, y: 4 }, [{ x: 0, y: 0 }, { x: 10, y: 0 }])).toBeCloseTo(5, 9)
  })
})
