import { beforeEach, describe, expect, it } from 'vitest'
import { usePersonal } from './personal'

describe('personas y vehículos', () => {
  beforeEach(() => usePersonal.setState({ visible: true, barreraAbierta: false }))
  it('el interruptor empieza encendido y se apaga y enciende', () => {
    usePersonal.getState().alternarPersonal()
    expect(usePersonal.getState().visible).toBe(false)
    usePersonal.getState().alternarPersonal()
    expect(usePersonal.getState().visible).toBe(true)
  })
  it('la barrera empieza cerrada y no cambia el estado si no cambia el valor', () => {
    expect(usePersonal.getState().barreraAbierta).toBe(false)
    const antes = usePersonal.getState()
    usePersonal.getState().fijarBarrera(false)
    expect(usePersonal.getState()).toBe(antes)
    usePersonal.getState().fijarBarrera(true)
    expect(usePersonal.getState().barreraAbierta).toBe(true)
  })
})
