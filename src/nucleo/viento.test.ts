import { describe, expect, it } from 'vitest'
import { balanceoArbol, direccionHacia, elevacionManga, inclinacionLlama, nombreDireccion, velocidadConRafaga } from './viento'

describe('velocidad con ráfaga', () => {
  const v = (t: number) => velocidadConRafaga(3, 0.4, 7, t)
  it('oscila alrededor de la media sin volverse negativa', () => {
    const muestras = Array.from({ length: 140 }, (_, i) => v(i * 0.1))
    expect(Math.min(...muestras)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...muestras)).toBeLessThanOrEqual(3 * 1.4 + 1e-9)
    expect(Math.min(...muestras)).toBeLessThanOrEqual(3 * 0.6 + 0.05)
    const media = muestras.reduce((s, x) => s + x, 0) / muestras.length
    expect(media).toBeCloseTo(3, 0)
  })
  it('se repite cada período', () => {
    expect(v(2)).toBeCloseTo(v(9), 9)
  })
  it('sin viento, sin ráfaga', () => {
    expect(velocidadConRafaga(0, 0.4, 7, 3)).toBe(0)
  })
})

describe('hacia dónde sopla', () => {
  it('un viento del sur sopla hacia el norte (−z); del oeste hacia el este (+x); del noreste hacia el suroeste', () => {
    const sur = direccionHacia(180)
    expect(sur[0]).toBeCloseTo(0, 9)
    expect(sur[1]).toBeCloseTo(-1, 9)
    const oeste = direccionHacia(270)
    expect(oeste[0]).toBeCloseTo(1, 9)
    expect(oeste[1]).toBeCloseTo(0, 9)
    const noreste = direccionHacia(45)
    expect(noreste[0]).toBeLessThan(0)
    expect(noreste[1]).toBeGreaterThan(0)
  })
  it('un viento del sur-suroeste (200°) sopla hacia el norte-noreste: −z y un poco +x', () => {
    const v = direccionHacia(200)
    expect(v[1]).toBeLessThan(-0.9)
    expect(v[0]).toBeGreaterThan(0)
    expect(Math.hypot(...v)).toBeCloseTo(1, 9)
  })
  it('el giro del norte se suma al giro del viento', () => {
    const [x, z] = direccionHacia(180, 90)
    expect(x).toBeCloseTo(1, 9)
    expect(z).toBeCloseTo(0, 9)
  })
  it('da el nombre en la rosa de los vientos (de dónde sopla)', () => {
    expect(nombreDireccion(0)).toBe('N')
    expect(nombreDireccion(200)).toBe('SSO')
    expect(nombreDireccion(270)).toBe('O')
    expect(nombreDireccion(359)).toBe('N')
  })
})

describe('efecto del viento', () => {
  it('la llama se inclina más con más viento y hasta un tope', () => {
    expect(inclinacionLlama(0)).toBe(0)
    expect(inclinacionLlama(6)).toBeGreaterThan(inclinacionLlama(3))
    expect(inclinacionLlama(100)).toBe(inclinacionLlama(50))
  })
  it('los árboles se balancean más con más viento y quietos sin viento', () => {
    expect(balanceoArbol(1.3, 0.2, 0)).toBe(0)
    const amplitud = (vel: number) => Math.max(...Array.from({ length: 100 }, (_, i) => Math.abs(balanceoArbol(i * 0.05, 0.2, vel))))
    expect(amplitud(6)).toBeGreaterThan(amplitud(2))
  })
  it('la manga cuelga con calma (90°) y se estira con viento (0° desde la velocidad de estiramiento)', () => {
    expect(elevacionManga(0)).toBe(90)
    expect(elevacionManga(3)).toBeLessThan(90)
    expect(elevacionManga(3)).toBeGreaterThan(0)
    expect(elevacionManga(100)).toBe(0)
  })
})
