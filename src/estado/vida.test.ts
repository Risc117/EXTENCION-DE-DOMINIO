import { beforeEach, describe, expect, it } from 'vitest'
import { useVida } from './vida'

describe('interruptor de la vida', () => {
  beforeEach(() => useVida.setState({ visible: true }))
  it('empieza encendido y se apaga y enciende', () => {
    expect(useVida.getState().visible).toBe(true)
    useVida.getState().alternarVida()
    expect(useVida.getState().visible).toBe(false)
    useVida.getState().alternarVida()
    expect(useVida.getState().visible).toBe(true)
  })
})
