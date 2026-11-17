import { describe, expect, it } from 'vitest'
import { puntoEnSuelo } from './suelo'

const plano = () => 0
const normal = (v: [number, number, number]): [number, number, number] => {
  const l = Math.hypot(...v)
  return [v[0] / l, v[1] / l, v[2] / l]
}

describe('punto del suelo que se mira', () => {
  it('en suelo plano, mirando hacia abajo y adelante, cae donde dice la trigonometría', () => {
    const p = puntoEnSuelo([0, 1.6, 0], normal([0, -0.5, -1]), plano, 60)!
    expect(p.z).toBeCloseTo(-3.2, 2)
    expect(p.x).toBeCloseTo(0, 6)
    expect(p.y).toBeCloseTo(0, 2)
    expect(p.distancia).toBeCloseTo(Math.hypot(3.2, 1.6), 2)
  })
  it('mirando al horizonte o hacia arriba no hay punto', () => {
    expect(puntoEnSuelo([0, 1.6, 0], [0, 0, -1], plano, 60)).toBeNull()
    expect(puntoEnSuelo([0, 1.6, 0], normal([0, 0.3, -1]), plano, 60)).toBeNull()
  })
  it('no da puntos más lejos del límite', () => {
    expect(puntoEnSuelo([0, 1.6, 0], normal([0, -0.01, -1]), plano, 60)).toBeNull()
    expect(puntoEnSuelo([0, 1.6, 0], normal([0, -0.05, -1]), plano, 60)).not.toBeNull()
  })
  it('en una pendiente que sube hacia el norte el punto queda más cerca y a su altura', () => {
    const sube = (_x: number, z: number) => -0.5 * z
    const p = puntoEnSuelo([0, 3, 0], normal([0, -0.2, -1]), sube, 60)!
    expect(p.y).toBeCloseTo(sube(p.x, p.z), 2)
    expect(p.z).toBeLessThan(0)
    const plano2 = puntoEnSuelo([0, 3, 0], normal([0, -0.2, -1]), plano, 60)!
    expect(Math.abs(p.z)).toBeLessThan(Math.abs(plano2.z))
  })
})
