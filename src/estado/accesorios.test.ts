import { describe, expect, it } from 'vitest'
import { useAccesorios } from './accesorios'

describe('interruptor de accesorios', () => {
  it('empiezan visibles y el interruptor los oculta y muestra', () => {
    expect(useAccesorios.getState().visibles).toBe(true)
    useAccesorios.getState().alternarAccesorios()
    expect(useAccesorios.getState().visibles).toBe(false)
    useAccesorios.getState().alternarAccesorios()
    expect(useAccesorios.getState().visibles).toBe(true)
  })
})
