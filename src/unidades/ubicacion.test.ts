import { describe, expect, it } from 'vitest'
import { aLocal, planoAMundo, type UbicacionEscena, type Vec3 } from './ubicacion'

const u: UbicacionEscena = { posicion: [10, 2, -5], giro: Math.PI / 2 }
const valor = (p: { normal: Vec3; constante: number }, x: Vec3) => p.normal[0] * x[0] + p.normal[1] * x[1] + p.normal[2] * x[2] + p.constante

describe('ubicación en la escena', () => {
  it('sin giro ni posición no cambia nada', () => {
    expect(aLocal([1, 2, 3], { posicion: [0, 0, 0], giro: 0 })).toEqual([1, 2, 3])
  })

  it('el centro de la unidad es el origen local', () => {
    const l = aLocal([10, 2, -5], u)
    l.forEach((v) => expect(v).toBeCloseTo(0))
  })

  it('un punto local girado 90° queda donde three.js lo pondría', () => {
    // three.js, rotation.y = 90°: el eje local +x apunta a -z del mundo.
    const l = aLocal([10, 2, -6], u)
    expect(l[0]).toBeCloseTo(1)
    expect(l[2]).toBeCloseTo(0)
  })

  it('el plano en el mundo da la misma distancia que el plano local', () => {
    const local = { normal: [0, 0, -1] as Vec3, constante: 1.5 }
    const mundo = planoAMundo(local, u)
    for (const p of [[11, 3, -2], [8, 0, -9], [10, 2, -5]] as Vec3[]) {
      expect(valor(mundo, p)).toBeCloseTo(valor(local, aLocal(p, u)))
    }
  })
})
