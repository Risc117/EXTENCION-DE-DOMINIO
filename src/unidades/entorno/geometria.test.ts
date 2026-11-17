import { describe, expect, it } from 'vitest'
import { cintaVia, circuloSobreTerreno, cotasBase, panelVertical } from './geometria'

const plano = (z: number) => () => z
const rampa = (x: number) => x * 0.1

describe('cotasBase', () => {
  it('el piso es la cota más alta bajo la planta y la base la más baja', () => {
    const r = cotasBase([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 5 }, { x: 0, y: 5 }], (x) => 100 + rampa(x))
    expect(r.piso).toBeCloseTo(101, 6)
    expect(r.base).toBeCloseTo(100, 6)
  })
})

describe('cintaVia', () => {
  it('una vía recta tiene el ancho pedido y sube sobre el terreno', () => {
    const c = cintaVia([{ x: 0, y: 0 }, { x: 0, y: 6 }], 4, plano(50), 40, 2)
    // puntos en la escena: [x, altura, -y]; izquierda y derecha a ±2 m del eje
    const xs = new Set<number>()
    for (let i = 0; i < c.posiciones.length; i += 3) xs.add(Math.round(c.posiciones[i] * 100) / 100)
    expect([...xs].sort((a, b) => a - b)).toEqual([-2, 2])
    expect(c.posiciones[1]).toBeGreaterThan(10)
    expect(c.posiciones.length / 3).toBe(8)
    expect(c.indices.length).toBe(3 * 2 * 3)
  })
})

describe('panelVertical', () => {
  it('sigue el terreno: la base en el suelo y el borde alto a la altura dada', () => {
    const p = panelVertical([{ x: 0, y: 0 }, { x: 4, y: 0 }], 2.4, rampa, 0, 2)
    expect(p.posiciones.length / 3).toBe(6)
    expect(p.posiciones[1]).toBeCloseTo(0, 6)
    expect(p.posiciones[4]).toBeCloseTo(2.4, 6)
    expect(p.posiciones[10] - p.posiciones[7]).toBeCloseTo(2.4, 6)
  })
})

describe('circuloSobreTerreno', () => {
  it('los puntos están a radio del centro, y cierra el círculo', () => {
    const c = circuloSobreTerreno({ x: 2, y: 3 }, 5, 16, plano(10), 0, 0)
    expect(c).toHaveLength(17)
    for (const [x, , z] of c) expect(Math.hypot(x - 2, -z - 3)).toBeCloseTo(5, 6)
    expect(c[16]).toEqual(c[0])
  })
})
