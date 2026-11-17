import { beforeEach, describe, expect, it } from 'vitest'
import { useConexiones } from './conexiones'

describe('interruptor del flujo en las tuberías', () => {
  beforeEach(() => useConexiones.setState({ flujo: true }))
  it('empieza encendido y se apaga y enciende', () => {
    expect(useConexiones.getState().flujo).toBe(true)
    useConexiones.getState().alternarFlujo()
    expect(useConexiones.getState().flujo).toBe(false)
    useConexiones.getState().alternarFlujo()
    expect(useConexiones.getState().flujo).toBe(true)
  })
})
