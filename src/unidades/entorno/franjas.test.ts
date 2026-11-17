import { describe, expect, it } from 'vitest'
import { cintaEntreMargenes, masCercano } from './franjas'

const finito = () => 50
const orilla = (x: number) => [{ x, y: 0 }, { x, y: 10 }]

describe('masCercano', () => {
  it('da el punto más cercano de entre varias líneas y su distancia', () => {
    const r = masCercano({ x: 0, y: 5 }, [orilla(-2), orilla(7)])
    expect(r.punto).toEqual({ x: -2, y: 5 })
    expect(r.distancia).toBeCloseTo(2, 6)
  })
})

describe('cintaEntreMargenes', () => {
  it('une cada punto de la orilla B con el más cercano de la A: ancho, cantidad y coordenada u', () => {
    const c = cintaEntreMargenes([orilla(-2)], orilla(2), 2, finito, 40, 0.1, 5, 50)
    expect(c.posiciones.length / 3).toBe(12)
    expect(c.indices.length).toBe(5 * 6)
    const xs = new Set<number>()
    for (let i = 0; i < c.posiciones.length; i += 3) xs.add(c.posiciones[i])
    expect([...xs].sort((a, b) => a - b)).toEqual([-2, 2])
    expect(c.posiciones[1]).toBeCloseTo(10.1, 6)
    // u crece con la distancia recorrida (cada 2 m, 5 m por patrón) y v va de 0 a 1 entre orillas
    expect(c.uv.slice(0, 4)).toEqual([0, 0, 0, 1])
    expect(c.uv[4]).toBeCloseTo(0.4, 6)
  })
  it('se corta donde se acaba el terreno', () => {
    const c = cintaEntreMargenes([orilla(-2)], orilla(2), 2, (_x, y) => (y > 5 ? Number.NEGATIVE_INFINITY : 50), 40, 0.1, 5, 50)
    expect(c.posiciones.length / 3).toBe(6)
  })
  it('ignora los puntos sin orilla A a la distancia máxima', () => {
    expect(cintaEntreMargenes([orilla(-100)], orilla(2), 2, finito, 40, 0.1, 5, 20).posiciones).toHaveLength(0)
  })
})
