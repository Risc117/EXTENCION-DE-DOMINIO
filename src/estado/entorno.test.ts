import { describe, expect, it } from 'vitest'
import { useEntorno } from './entorno'

describe('interruptor del entorno', () => {
  it('empieza encendido y se apaga y enciende', () => {
    expect(useEntorno.getState().visible).toBe(true)
    useEntorno.getState().alternarEntorno()
    expect(useEntorno.getState().visible).toBe(false)
    useEntorno.getState().alternarEntorno()
    expect(useEntorno.getState().visible).toBe(true)
  })
})
