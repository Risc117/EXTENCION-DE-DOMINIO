import { describe, expect, it } from 'vitest'
import { hidrograma } from './hidrogramaCargado'
import { volumenRequerido } from './requerido'

describe('volumenRequerido', () => {
  it('día 1 (escalado a Qp): el balance entrada - salida media da ≈ 113 m³, la mitad que con el hidrograma original (T9.5)', () => {
    // La hoja da 213.7 m³ por un método que no se pudo reproducir con estos datos (ver tickets/T3.md).
    expect(volumenRequerido(hidrograma, 1)).toBeCloseTo(113.5, 0)
  })

  it('con caudal parejo no hace falta volumen', () => {
    const parejo = { ...hidrograma, caudalEntrada: () => 13, promedio: () => 13 }
    expect(volumenRequerido(parejo, 1)).toBeCloseTo(0, 6)
  })
})
