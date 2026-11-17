import { beforeEach, describe, expect, it } from 'vitest'
import { useCorte } from '../../estado/flujo'
import { corteEfectivo } from './corte'

describe('corte por estructura', () => {
  it('sin "solo la estructura elegida", el corte se hace en todas las unidades', () => {
    expect(corteEfectivo(true, false, null, 'rafa')).toBe(true)
    expect(corteEfectivo(true, false, 'bombeo', 'rafa')).toBe(true)
  })
  it('con "solo la estructura elegida", solo se corta la enfocada', () => {
    expect(corteEfectivo(true, true, 'rafa', 'rafa')).toBe(true)
    expect(corteEfectivo(true, true, 'rafa', 'percolador')).toBe(false)
  })
  it('con "solo la estructura elegida" y ninguna enfocada, no se corta ninguna', () => {
    expect(corteEfectivo(true, true, null, 'rafa')).toBe(false)
  })
  it('sin corte activo nunca se corta', () => {
    expect(corteEfectivo(false, true, 'rafa', 'rafa')).toBe(false)
    expect(corteEfectivo(false, false, null, 'rafa')).toBe(false)
  })
  it('una ubicación sin id (la de pruebas) no se corta cuando el corte es solo de la enfocada', () => {
    expect(corteEfectivo(true, true, 'rafa', undefined)).toBe(false)
    expect(corteEfectivo(true, false, 'rafa', undefined)).toBe(true)
  })
})

describe('interruptor del corte por estructura', () => {
  beforeEach(() => useCorte.setState({ activo: false, soloEnfocada: false }))
  it('empieza apagado (corte en todas) y se alterna', () => {
    expect(useCorte.getState().soloEnfocada).toBe(false)
    useCorte.getState().alternarSoloEnfocada()
    expect(useCorte.getState().soloEnfocada).toBe(true)
    useCorte.getState().alternarSoloEnfocada()
    expect(useCorte.getState().soloEnfocada).toBe(false)
  })
})
