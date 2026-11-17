import { describe, expect, it } from 'vitest'
import { anguloPluma, barreraAbierta, quienesActuan } from './horario'

describe('horario según el sol', () => {
  it('de día hay técnicos, todos los vehículos y no hay vigilante ni faros', () => {
    expect(quienesActuan(40, 4, 2)).toEqual({ tecnicos: 4, vehiculos: 2, vigilante: false, faros: false })
  })
  it('de noche solo el vigilante y un vehículo con faros', () => {
    expect(quienesActuan(-30, 4, 2)).toEqual({ tecnicos: 0, vehiculos: 1, vigilante: true, faros: true })
    expect(quienesActuan(-30, 4, 0).vehiculos).toBe(0)
  })
  it('con el sol justo bajo el horizonte ya se encienden los faros, igual que las luminarias', () => {
    expect(quienesActuan(-5, 2, 1).faros).toBe(true)
  })
})

describe('barrera', () => {
  const centro = { x: -3.5, y: -79.4 }
  it('se abre si algún vehículo está dentro del radio', () => {
    expect(barreraAbierta([{ x: 5, y: -79.4 }], centro, 9)).toBe(true)
    expect(barreraAbierta([{ x: 30, y: -79.4 }, { x: -3.5, y: -70 }], centro, 9)).toBe(false)
    expect(barreraAbierta([], centro, 9)).toBe(false)
  })
  it('la pluma sube y baja a su rapidez sin pasarse', () => {
    expect(anguloPluma(0, true, 0.5, 70, 90)).toBeCloseTo(45, 9)
    expect(anguloPluma(60, true, 1, 70, 90)).toBe(70)
    expect(anguloPluma(30, false, 0.2, 70, 90)).toBeCloseTo(12, 9)
    expect(anguloPluma(5, false, 1, 70, 90)).toBe(0)
  })
})
