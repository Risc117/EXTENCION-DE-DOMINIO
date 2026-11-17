import { describe, expect, it } from 'vitest'
import { alturaGota, desfasePunto, fasesGotas } from './gotas'

describe('alturaGota', () => {
  it('empieza arriba, baja a velocidad constante y vuelve a empezar al llegar abajo', () => {
    expect(alturaGota(0, 0, 2, 10, 0)).toBeCloseTo(10, 9)
    expect(alturaGota(0, 1, 2, 10, 0)).toBeCloseTo(8, 9)
    expect(alturaGota(0, 5, 2, 10, 0)).toBeCloseTo(10, 9) // 5 s × 2 m/s = 10 m: vuelve arriba
    expect(alturaGota(0, 6, 2, 10, 0)).toBeCloseTo(8, 9)
  })
  it('siempre está entre abajo y arriba', () => {
    for (let t = 0; t < 20; t += 0.37) {
      const y = alturaGota(0.3, t, 1.7, 4, 1)
      expect(y).toBeLessThanOrEqual(4)
      expect(y).toBeGreaterThanOrEqual(1)
    }
  })
  it('la fase desplaza la gota a lo largo de la caída', () => {
    expect(alturaGota(0.5, 0, 2, 10, 0)).toBeCloseTo(5, 9)
  })
  it('sin velocidad (sin caudal) no cae', () => {
    expect(alturaGota(0.25, 100, 0, 10, 0)).toBeCloseTo(7.5, 9)
  })
})

describe('fasesGotas', () => {
  it('reparte n fases distintas entre 0 y 1', () => {
    const f = fasesGotas(4)
    expect(f).toEqual([0, 0.25, 0.5, 0.75])
  })
  it('con un desfase por punto, las gotas de puntos vecinos no caen juntas', () => {
    expect(fasesGotas(3, 0.1)[0]).toBeCloseTo(0.1, 9)
    expect(fasesGotas(3, 0.1).every((v) => v >= 0 && v < 1)).toBe(true)
  })
})

describe('desfasePunto', () => {
  it('cada punto empieza en una fase distinta (entre 0 y 1) y el primero en 0', () => {
    expect(desfasePunto(0)).toBe(0)
    const fases = Array.from({ length: 20 }, (_, i) => desfasePunto(i))
    expect(new Set(fases).size).toBe(20)
    expect(fases.every((f) => f >= 0 && f < 1)).toBe(true)
  })
})
