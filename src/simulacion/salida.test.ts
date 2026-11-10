import { describe, expect, it } from 'vitest'
import { CD_SALIDA, GRAVEDAD } from '../nucleo/constantes'
import type { ParametrosTanque } from '../estado/simulacion'
import { caudalGravedad, caudalSalida } from './salida'

const tanque: ParametrosTanque = { area: 45.13, alturaUtil: 4.9, alturaTotal: 5.4, alturaEjeSalida: 0.3, diametroSalida: 0.16 }

describe('salida por gravedad (Q = Cd·A·√(2·g·h))', () => {
  it('con el tanque vacío la salida es 0', () => {
    expect(caudalGravedad(0, tanque)).toBe(0)
  })

  it('con el nivel bajo el eje de la salida es 0', () => {
    expect(caudalGravedad(0.3, tanque)).toBe(0)
    expect(caudalGravedad(0.1, tanque)).toBe(0)
  })

  it('más nivel da más caudal', () => {
    expect(caudalGravedad(2, tanque)).toBeGreaterThan(caudalGravedad(1, tanque))
    expect(caudalGravedad(4.9, tanque)).toBeGreaterThan(caudalGravedad(2, tanque))
  })

  it('coincide con la fórmula, en L/s', () => {
    const area = (Math.PI * 0.16 ** 2) / 4
    const esperado = 1000 * CD_SALIDA * area * Math.sqrt(2 * GRAVEDAD * (2.3 - 0.3))
    expect(caudalGravedad(2.3, tanque)).toBeCloseTo(esperado, 6)
  })
})

describe('caudalSalida según el modo', () => {
  it('modo constante usa el promedio del día', () => {
    expect(caudalSalida('constante', 3, 13, null, tanque)).toBe(13)
  })

  it('modo constante usa el valor ajustado a mano si existe', () => {
    expect(caudalSalida('constante', 3, 13, 8, tanque)).toBe(8)
  })

  it('modo gravedad ignora el promedio y depende del nivel', () => {
    expect(caudalSalida('gravedad', 0, 13, null, tanque)).toBe(0)
    expect(caudalSalida('gravedad', 3, 13, null, tanque)).toBeGreaterThan(0)
  })
})
