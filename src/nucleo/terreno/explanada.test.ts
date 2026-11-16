import { describe, expect, it } from 'vitest'
import { alturaEn, type Cuadricula } from './altura'
import { aplanar } from './explanada'

const cotas = new Array(21 * 21).fill(100)
const plano: Cuadricula = { x0: -50, y0: -50, paso: 5, columnas: 21, filas: 21, cotas }
const una = { x: 0, y: 0, cota: 104, radio: 10 }

describe('aplanar', () => {
  it('deja plano a la cota de la explanada dentro de su radio', () => {
    const g = aplanar(plano, [una], 10)
    for (const [x, y] of [[0, 0], [5, 0], [0, -5], [-5, 5]]) expect(alturaEn(g, x, y)).toBeCloseTo(104)
  })

  it('no toca el terreno más allá del radio más la transición', () => {
    const g = aplanar(plano, [una], 10)
    expect(alturaEn(g, 30, 0)).toBe(100)
    expect(alturaEn(g, 0, -45)).toBe(100)
  })

  it('en la transición baja sin saltos y sin pasarse de las dos cotas', () => {
    const g = aplanar(plano, [una], 10)
    let anterior = 104
    for (let x = 10; x <= 20; x += 1) {
      const h = alturaEn(g, x, 0)!
      expect(h).toBeLessThanOrEqual(anterior + 1e-9)
      expect(h).toBeGreaterThanOrEqual(100 - 1e-9)
      expect(anterior - h).toBeLessThan(1.5)
      anterior = h
    }
  })

  it('no cambia la cuadrícula original y sin explanadas devuelve las mismas cotas', () => {
    aplanar(plano, [una], 10)
    expect(plano.cotas.every((c) => c === 100)).toBe(true)
    expect(aplanar(plano, [], 10).cotas).toEqual(plano.cotas)
  })

  it('con dos explanadas encimadas el resultado no depende del orden', () => {
    const otra = { x: 8, y: 0, cota: 98, radio: 6 }
    const a = aplanar(plano, [una, otra], 10).cotas
    const b = aplanar(plano, [otra, una], 10).cotas
    a.forEach((c, i) => expect(c).toBeCloseTo(b[i]))
  })
})
