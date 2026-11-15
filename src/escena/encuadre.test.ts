import { describe, expect, it } from 'vitest'
import { OBJETIVO_CAMARA } from '../nucleo/constantes'
import { encuadre } from './encuadre'

const a = { id: 'a', posicion: { x: 0, y: 0 }, cotaFondo: 10, tamano: 10 }
const b = { id: 'b', posicion: { x: 100, y: 40 }, cotaFondo: 12, tamano: 20 }

describe('encuadre', () => {
  it('con foco en una unidad mira su centro, a su altura, con su tamaño', () => {
    const e = encuadre([a, b], 'b')
    expect(e.objetivo).toEqual([100, 2 + OBJETIVO_CAMARA[1], -40])
    expect(e.escala).toBe(20)
  })

  it('sin foco mira el centro de toda la planta y abarca todas las unidades', () => {
    const e = encuadre([a, b], null)
    expect(e.objetivo[0]).toBeCloseTo((-5 + 110) / 2)
    expect(e.objetivo[2]).toBeCloseTo(-((-5 + 50) / 2))
    expect(e.escala).toBeGreaterThanOrEqual(115)
  })

  it('un foco desconocido cae en la vista general', () => {
    expect(encuadre([a, b], 'x')).toEqual(encuadre([a, b], null))
  })

  it('la unidad enfocada es mucho más cercana que la vista general', () => {
    expect(encuadre([a, b], 'a').escala).toBeLessThan(encuadre([a, b], null).escala / 5)
  })
})
