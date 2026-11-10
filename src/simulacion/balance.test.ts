import { describe, expect, it } from 'vitest'
import type { ParametrosTanque } from '../estado/simulacion'
import { pasoBalance } from './balance'

const AREA = Math.PI * 3.79 ** 2
const tanque: ParametrosTanque = { area: AREA, alturaUtil: 4.9, alturaTotal: 5.4, alturaEjeSalida: 0.3, diametroSalida: 0.16 }

describe('pasoBalance (dV/dt = Qentrada - Qsalida)', () => {
  it('caudal constante: entran 13 L/s y salen 10 L/s durante 1 h suben 10.8 m³', () => {
    const r = pasoBalance(0, 13, 10, 3600, tanque)
    expect(r.volumen).toBeCloseTo(10.8, 6)
    expect(r.caudalSalida).toBeCloseTo(10, 6)
    expect(r.caudalRebose).toBe(0)
  })

  it('entrada igual a salida: el volumen no cambia', () => {
    expect(pasoBalance(50, 13, 13, 600, tanque).volumen).toBeCloseTo(50, 6)
  })

  it('tanque vacío: no baja de cero y solo sale lo que entra', () => {
    const r = pasoBalance(0, 5, 13, 60, tanque)
    expect(r.volumen).toBe(0)
    expect(r.caudalSalida).toBeCloseTo(5, 6)
  })

  it('tanque casi vacío: solo sale lo que hay', () => {
    const r = pasoBalance(0.06, 0, 13, 60, tanque)
    expect(r.volumen).toBe(0)
    expect(r.caudalSalida).toBeCloseTo(1, 6)
  })

  it('rebose: el volumen se queda en la altura total y el exceso se cuenta aparte', () => {
    const lleno = AREA * 5.4
    const r = pasoBalance(lleno - 0.01, 20, 10, 60, tanque)
    expect(r.volumen).toBeCloseTo(lleno, 6)
    expect(r.caudalRebose).toBeGreaterThan(0)
    // Entran 0.6 m³ en el paso, salen 0.6 m³ de los 0.01 que cabían... exceso = (20-10)*60/1000 - 0.01 = 0.59 m³
    expect((r.caudalRebose * 60) / 1000).toBeCloseTo(0.59, 6)
  })
})
