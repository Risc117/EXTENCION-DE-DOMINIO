import { describe, expect, it } from 'vitest'
import { posicionEnCirculo, posicionEnRuta, repartirPasto, type Punto } from './reparto'

const franja: Punto[] = [{ x: 0, y: 0 }, { x: 10, y: 0 }]
const cerco: Punto[][] = [[{ x: 0, y: 3 }, { x: 10, y: 3 }]]

describe('reparto del pasto', () => {
  it('queda entre la franja y el cerco, dentro del ancho', () => {
    const hojas = repartirPasto(franja, cerco, 500, 2, 7)
    expect(hojas).toHaveLength(500)
    for (const h of hojas) {
      expect(h.x).toBeGreaterThanOrEqual(-1e-9)
      expect(h.x).toBeLessThanOrEqual(10 + 1e-9)
      expect(h.y).toBeGreaterThanOrEqual(-1e-9)
      expect(h.y).toBeLessThanOrEqual(2 + 1e-9)
    }
  })
  it('no sale del cerco aunque el ancho sea mayor que la distancia a él', () => {
    for (const h of repartirPasto(franja, cerco, 300, 50, 3)) expect(h.y).toBeLessThanOrEqual(3 + 1e-9)
  })
  it('es siempre el mismo con la misma semilla y distinto con otra', () => {
    expect(repartirPasto(franja, cerco, 20, 2, 7)).toEqual(repartirPasto(franja, cerco, 20, 2, 7))
    expect(repartirPasto(franja, cerco, 20, 2, 8)).not.toEqual(repartirPasto(franja, cerco, 20, 2, 7))
  })
  it('con menos hojas (calidad baja) son las primeras de las mismas', () => {
    expect(repartirPasto(franja, cerco, 5, 2, 7)).toEqual(repartirPasto(franja, cerco, 10, 2, 7).slice(0, 5))
  })
})

describe('recorrido por una ruta (ida y vuelta)', () => {
  const ruta: Punto[] = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }]
  it('avanza a su velocidad y rumbo según el tramo', () => {
    const p = posicionEnRuta(ruta, 2, 3, 0)
    expect(p.x).toBeCloseTo(6, 9)
    expect(p.y).toBeCloseTo(0, 9)
    expect(Math.cos(p.rumbo)).toBeCloseTo(1, 9)
    const q = posicionEnRuta(ruta, 2, 7, 0)
    expect(q.x).toBeCloseTo(10, 9)
    expect(q.y).toBeCloseTo(4, 9)
  })
  it('al llegar al final da la vuelta y es periódica', () => {
    const largo = 20
    const ida = posicionEnRuta(ruta, 2, 9, 0)
    const vuelta = posicionEnRuta(ruta, 2, 11, 0)
    expect(ida.y).toBeCloseTo(vuelta.y, 9)
    expect(Math.cos(vuelta.rumbo - ida.rumbo)).toBeCloseTo(-1, 9)
    const a = posicionEnRuta(ruta, 2, 1, 0)
    const b = posicionEnRuta(ruta, 2, 1 + (2 * largo) / 2, 0)
    expect(b.x).toBeCloseTo(a.x, 9)
  })
  it('la fase desplaza al animal por la ruta', () => {
    expect(posicionEnRuta(ruta, 2, 0, 0.25).x).toBeCloseTo(10, 9)
  })
})

describe('recorrido en círculo', () => {
  it('queda a un radio del centro y avanza a su velocidad', () => {
    const c = { x: 5, y: -7 }
    const a = posicionEnCirculo(c, 10, 2, 0, 0)
    const b = posicionEnCirculo(c, 10, 2, 1, 0)
    expect(Math.hypot(a.x - c.x, a.y - c.y)).toBeCloseTo(10, 9)
    expect(Math.hypot(b.x - c.x, b.y - c.y)).toBeCloseTo(10, 9)
    expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeCloseTo(2 * 10 * Math.sin(2 / 20), 6)
  })
  it('el rumbo es la tangente (perpendicular al radio)', () => {
    const c = { x: 0, y: 0 }
    const p = posicionEnCirculo(c, 10, 2, 0, 0)
    expect(p.x * Math.cos(p.rumbo) + p.y * Math.sin(p.rumbo)).toBeCloseTo(0, 9)
  })
})
