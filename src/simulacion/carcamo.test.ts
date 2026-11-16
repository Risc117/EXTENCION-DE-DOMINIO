import { describe, expect, it } from 'vitest'
import { MEDIDAS_BOMBEO_INICIALES, type ParametrosBombeo } from '../estado/bombeo'
import { avanzarCarcamo } from './carcamo'

const P: ParametrosBombeo = { area: 8, nivelArranque: 1.6, nivelParada: 0.6, caudalBomba: 13, cantidad: 2 }
const inicio = { ...MEDIDAS_BOMBEO_INICIALES, nivel: 0.6 }

describe('cárcamo y bombas', () => {
  it('sin bomba el nivel sube con el caudal que llega', () => {
    const m = avanzarCarcamo(inicio, P, 8, 100)
    expect(m.nivel).toBeCloseTo(0.6 + (8 * 100) / (8 * 1000), 6)
    expect(m.bombaActiva).toBeNull()
  })

  it('arranca al llegar al nivel de arranque', () => {
    const m = avanzarCarcamo({ ...inicio, nivel: 1.59 }, P, 8, 100)
    expect(m.bombaActiva).toBe(0)
    expect(m.arranques).toBe(1)
  })

  it('para al bajar al nivel de parada y no antes', () => {
    let m = avanzarCarcamo({ ...inicio, nivel: 1.6 }, P, 6, 20)
    expect(m.bombaActiva).not.toBeNull()
    m = avanzarCarcamo(m, P, 6, 3000)
    expect(m.nivel).toBeGreaterThan(0)
    expect(m.nivel).toBeLessThanOrEqual(P.nivelArranque)
    expect(m.arranques).toBeGreaterThan(1)
  })

  it('las bombas se turnan en cada arranque', () => {
    let m = { ...inicio, nivel: 1.6 }
    const usadas = new Set<number>()
    for (let i = 0; i < 400; i++) {
      m = avanzarCarcamo(m, P, 6, 30)
      if (m.bombaActiva !== null) usadas.add(m.bombaActiva)
    }
    expect([...usadas].sort()).toEqual([0, 1])
  })

  it('el nivel queda entre parada y arranque en régimen y nunca es negativo', () => {
    let m = inicio
    let min = Infinity
    let max = 0
    for (let i = 0; i < 2000; i++) {
      m = avanzarCarcamo(m, P, 6.5, 30)
      min = Math.min(min, m.nivel)
      max = Math.max(max, m.nivel)
    }
    expect(min).toBeGreaterThanOrEqual(0)
    expect(max).toBeLessThan(P.nivelArranque + 0.1)
    expect(min).toBeGreaterThan(P.nivelParada - 0.1)
  })

  it('el caudal impulsado promedio es el que llega', () => {
    let m = inicio
    let suma = 0
    const pasos = 5000
    for (let i = 0; i < pasos; i++) {
      m = avanzarCarcamo(m, P, 6.5, 30)
      suma += m.caudalImpulsado
    }
    expect(suma / pasos).toBeCloseTo(6.5, 0)
  })

  it('con caudal cero y bomba andando no vacía más de lo que hay', () => {
    const m = avanzarCarcamo({ ...inicio, nivel: 1.6 }, P, 0, 5000)
    expect(m.nivel).toBeGreaterThanOrEqual(0)
  })
})
