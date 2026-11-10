import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/homogeneizador.json'
import { areaUtil, volumenUtil } from './calculos'
import { esquemaHomogeneizador } from './esquema'

const datos = esquemaHomogeneizador.parse(crudo)

describe('cálculos del tanque circular', () => {
  it('área útil = π·(Di/2)² ≈ 45.1 m²', () => {
    expect(areaUtil(datos)).toBeCloseTo(Math.PI * 3.79 ** 2, 6)
    expect(areaUtil(datos)).toBeCloseTo(45.1, 1)
  })

  it('volumen útil ≈ 221 m³', () => {
    expect(volumenUtil(datos)).toBeCloseTo(221.1, 1)
  })

  it('cambia al cambiar el diámetro o la altura del JSON', () => {
    const otro = structuredClone(datos)
    otro.tanque.diametroInterior.valor = 10
    otro.tanque.alturaUtil.valor = 2
    expect(areaUtil(otro)).toBeCloseTo(Math.PI * 25, 6)
    expect(volumenUtil(otro)).toBeCloseTo(Math.PI * 50, 6)
  })
})
