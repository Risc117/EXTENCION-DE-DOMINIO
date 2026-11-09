import { describe, expect, it } from 'vitest'
import { factorRueda, giroPorArrastre } from './mouse'

describe('mouse → intenciones', () => {
  it('arrastrar a la derecha baja el acimut; hacia abajo sube la elevación', () => {
    const g = giroPorArrastre(10, 10)
    expect(g.acimut).toBeLessThan(0)
    expect(g.elevacion).toBeGreaterThan(0)
  })

  it('sin movimiento no hay giro', () => {
    expect(giroPorArrastre(0, 0)).toEqual({ acimut: -0, elevacion: 0 })
  })

  it('la rueda hacia adelante acerca y hacia atrás aleja', () => {
    expect(factorRueda(-100)).toBeLessThan(1)
    expect(factorRueda(100)).toBeGreaterThan(1)
    expect(factorRueda(0)).toBe(1)
  })
})
