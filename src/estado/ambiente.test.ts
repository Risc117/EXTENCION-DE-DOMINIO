import { describe, expect, it } from 'vitest'
import { horaAmbiente, useAmbiente } from './ambiente'

describe('hora del ambiente', () => {
  it('por defecto sigue la simulación', () => {
    expect(useAmbiente.getState().horaFija).toBeNull()
    expect(horaAmbiente(9.5, null)).toBe(9.5)
  })
  it('al fijar la hora, esa manda sobre la simulación', () => {
    useAmbiente.getState().fijarHora(22)
    expect(horaAmbiente(9.5, useAmbiente.getState().horaFija)).toBe(22)
    useAmbiente.getState().seguirSimulacion()
    expect(useAmbiente.getState().horaFija).toBeNull()
  })
  it('la hora fijada se mantiene entre 0 y 24', () => {
    useAmbiente.getState().fijarHora(30)
    expect(useAmbiente.getState().horaFija).toBeLessThan(24)
    useAmbiente.getState().fijarHora(-3)
    expect(useAmbiente.getState().horaFija).toBeGreaterThanOrEqual(0)
    useAmbiente.getState().seguirSimulacion()
  })
})
