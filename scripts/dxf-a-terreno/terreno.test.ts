import { describe, expect, it } from 'vitest'
import { crearMalla, densificar } from './malla.ts'
import { simplificar } from './simplificar.ts'

describe('densificar', () => {
  it('agrega vértices para que ningún tramo supere el máximo', () => {
    const p = densificar([[0, 0], [10, 0]], 2.5)
    expect(p).toHaveLength(5)
    expect(p[4]).toEqual([10, 0])
  })
})

describe('simplificar', () => {
  it('quita los vértices alineados y conserva los extremos y las esquinas', () => {
    const r = simplificar([[0, 0], [5, 0.01], [10, 0], [10, 10]], 0.1)
    expect(r).toEqual([[0, 0], [10, 0], [10, 10]])
  })
})

describe('crearMalla', () => {
  /** Dos curvas rectas paralelas: cota 100 en y = 0 y cota 110 en y = 10. */
  const curvas = [
    { cota: 100, tipo: 'menor' as const, puntos: [[0, 0], [40, 0]] as [number, number][] },
    { cota: 110, tipo: 'menor' as const, puntos: [[0, 10], [40, 10]] as [number, number][] },
  ]
  it('interpola entre curvas y respeta las curvas mismas', () => {
    const m = crearMalla(curvas, 2)
    const h = (x: number, y: number) => m.alturas[Math.round((y - m.y0) / m.paso) * m.columnas + Math.round((x - m.x0) / m.paso)]
    expect(h(20, 0)).toBeCloseTo(100, 5)
    expect(h(20, 10)).toBeCloseTo(110, 5)
    expect(h(20, 4)).toBeCloseTo(104, 1)
  })
  it('no deja nodos sin altura', () => {
    const m = crearMalla(curvas, 7)
    expect(m.alturas.every(Number.isFinite)).toBe(true)
  })
})
