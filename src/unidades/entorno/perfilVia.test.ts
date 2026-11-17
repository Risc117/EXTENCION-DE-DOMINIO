import { describe, expect, it } from 'vitest'
import { perfilSuave } from './perfilVia'

const maxPendiente = (h: number[], paso: number) => Math.max(...h.slice(1).map((v, i) => Math.abs(v - h[i]) / paso))
const libres = (n: number) => Array<boolean>(n).fill(false)

describe('perfilSuave', () => {
  it('una recta con pendiente menor a la máxima queda igual', () => {
    const h = Array.from({ length: 41 }, (_, i) => 100 - 0.03 * 1.5 * i)
    const r = perfilSuave(h, 1.5, libres(41), 30, 0.08)
    r.alturas.forEach((v, i) => expect(v).toBeCloseTo(h[i], 6))
    expect(r.cumple).toBe(true)
  })
  it('quita el zigzag del terreno y no pasa de la pendiente máxima', () => {
    const h = Array.from({ length: 80 }, (_, i) => 100 - 0.05 * 1.5 * i + (i % 2 === 0 ? 0.9 : -0.9) + (i > 40 ? -4 : 0))
    expect(maxPendiente(h, 1.5)).toBeGreaterThan(0.5)
    const r = perfilSuave(h, 1.5, libres(80), 30, 0.08)
    expect(maxPendiente(r.alturas, 1.5)).toBeLessThanOrEqual(0.08 + 1e-6)
    expect(r.cumple).toBe(true)
  })
  it('deja como están las estaciones ancladas (por la explanada del RAFA); su pendiente es la del terreno y no cuenta', () => {
    const h = Array.from({ length: 30 }, (_, i) => 100 - 0.02 * 1.5 * i)
    const ancladas = libres(30)
    for (let i = 10; i < 16; i++) ancladas[i] = true
    h[12] = 95
    const r = perfilSuave(h, 1.5, ancladas, 30, 0.08)
    for (let i = 10; i < 16; i++) expect(r.alturas[i]).toBe(h[i])
    expect(r.cumple).toBe(true)
    expect(r.pendienteAnclada).toBeGreaterThan(1)
  })
  it('avisa si un tramo libre entre dos anclas no puede respetar la pendiente', () => {
    const h = Array.from({ length: 20 }, () => 100)
    const ancladas = libres(20)
    ancladas[5] = ancladas[9] = true
    h[9] = 90
    expect(perfilSuave(h, 1.5, ancladas, 30, 0.08).cumple).toBe(false)
  })
  it('conserva el primer y el último punto cuando son compatibles con la pendiente', () => {
    const h = Array.from({ length: 21 }, (_, i) => 100 - 0.04 * 1.5 * i)
    const r = perfilSuave(h, 1.5, libres(21), 30, 0.08)
    expect(r.alturas[0]).toBeCloseTo(100, 3)
  })
})
