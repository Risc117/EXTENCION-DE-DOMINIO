import { describe, expect, it } from 'vitest'
import { crearAzar, entre } from './azar'

describe('crearAzar', () => {
  it('da números entre 0 y 1 y repite con la misma semilla', () => {
    const a = crearAzar(3)
    const b = crearAzar(3)
    for (let i = 0; i < 50; i++) {
      const v = a()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
      expect(b()).toBe(v)
    }
  })

  it('entre() queda dentro del rango', () => {
    const azar = crearAzar(1)
    for (let i = 0; i < 50; i++) {
      const v = entre(azar, 2, 5)
      expect(v).toBeGreaterThanOrEqual(2)
      expect(v).toBeLessThan(5)
    }
  })
})
