import { describe, expect, it } from 'vitest'
import { rayoContraTerreno } from './rayo'

/** Pendiente que sube hacia el este: cota = 100 + x/10, de x = 0 a 100. */
const g = { x0: 0, y0: -50, paso: 10, columnas: 11, filas: 11, cotas: Array.from({ length: 121 }, (_, i) => 100 + (i % 11)) }

describe('rayoContraTerreno', () => {
  it('encuentra el punto donde un rayo vertical toca el terreno', () => {
    const p = rayoContraTerreno(g, 100, [50, 20, 0], [0, -1, 0], 100)
    expect(p?.x).toBeCloseTo(50, 1)
    expect(p?.cota).toBeCloseTo(105, 1)
  })

  it('con un rayo inclinado la cota que da es la del terreno en ese punto', () => {
    const p = rayoContraTerreno(g, 100, [0, 30, 0], [0.6, -0.8, 0], 200)
    expect(p).not.toBeNull()
    expect(p!.cota).toBeCloseTo(100 + p!.x / 10, 1)
  })

  it('usa y = -z: un punto al norte tiene y positivo', () => {
    const p = rayoContraTerreno(g, 100, [20, 20, -30], [0, -1, 0], 100)
    expect(p?.y).toBeCloseTo(30, 1)
  })

  it('devuelve null si el rayo no toca el terreno', () => {
    expect(rayoContraTerreno(g, 100, [50, 20, 0], [0, 1, 0], 100)).toBeNull()
    expect(rayoContraTerreno(g, 100, [500, 20, 0], [0, -1, 0], 100)).toBeNull()
  })
})
