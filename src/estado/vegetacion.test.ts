import { beforeEach, describe, expect, it } from 'vitest'
import { useVegetacion } from './vegetacion'

describe('interruptor de la vegetación de los alrededores', () => {
  beforeEach(() => useVegetacion.setState({ visible: true }))
  it('empieza encendido y se apaga y enciende', () => {
    expect(useVegetacion.getState().visible).toBe(true)
    useVegetacion.getState().alternarVegetacion()
    expect(useVegetacion.getState().visible).toBe(false)
    useVegetacion.getState().alternarVegetacion()
    expect(useVegetacion.getState().visible).toBe(true)
  })
})
