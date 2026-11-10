import { describe, expect, it } from 'vitest'
import { hidrograma } from './hidrogramaCargado'
import { volumenRequerido } from './requerido'

describe('volumenRequerido', () => {
  it('día 1: entre el mínimo y el máximo del balance (entrada - salida media) son ≈ 226 m³', () => {
    // La hoja da 213.7 m³ por un método que no se pudo reproducir con estos datos (ver tickets/T3.md).
    expect(volumenRequerido(hidrograma, 1)).toBeCloseTo(225.8, 0)
  })

  it('con caudal parejo no hace falta volumen', () => {
    const parejo = { ...hidrograma, caudalEntrada: () => 13, promedio: () => 13 }
    expect(volumenRequerido(parejo, 1)).toBeCloseTo(0, 6)
  })
})
