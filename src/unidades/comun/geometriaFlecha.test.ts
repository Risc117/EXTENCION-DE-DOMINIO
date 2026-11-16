import { describe, expect, it } from 'vitest'
import { Quaternion, Vector3 } from 'three'
import { geometriaFlecha } from './geometriaFlecha'

describe('geometriaFlecha', () => {
  it('el cono queda con su punta en el punto indicado y mira en la dirección dada', () => {
    const g = geometriaFlecha([2, 3, 4], [1, 0, 0], 0.4)
    const q = new Quaternion(...g.cuaternion)
    const arriba = new Vector3(0, 1, 0).applyQuaternion(q)
    expect(arriba.x).toBeCloseTo(1)
    expect(arriba.y).toBeCloseTo(0)
    const punta = new Vector3(0, 0.2, 0).applyQuaternion(q).add(new Vector3(...g.posicion))
    expect(punta.x).toBeCloseTo(2)
    expect(punta.y).toBeCloseTo(3)
    expect(punta.z).toBeCloseTo(4)
  })

  it('acepta una dirección que no está normalizada', () => {
    const g = geometriaFlecha([0, 0, 0], [0, -5, 0], 0.4)
    const arriba = new Vector3(0, 1, 0).applyQuaternion(new Quaternion(...g.cuaternion))
    expect(arriba.y).toBeCloseTo(-1)
  })
})
