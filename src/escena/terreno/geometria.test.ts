import { describe, expect, it } from 'vitest'
import { segmentosCurvas } from './geometriaCurvas'
import { geometriaMuro, muestrearTrazo } from './geometriaMuro'
import { fraccionAltura, geometriaTerreno } from './geometriaTerreno'

const g = { x0: 10, y0: 20, paso: 5, columnas: 3, filas: 2, cotas: [100, 101, 102, 103, 104, 105] }

describe('geometriaTerreno', () => {
  it('pone x al este, y hacia arriba (cota menos referencia) y z hacia el sur', () => {
    const d = geometriaTerreno(g, 100)
    expect(Array.from(d.posiciones.slice(0, 3))).toEqual([10, 0, -20])
    expect(Array.from(d.posiciones.slice(12, 15))).toEqual([15, 4, -25])
  })

  it('arma dos triángulos por celda y los deja mirando hacia arriba', () => {
    const d = geometriaTerreno(g, 100)
    expect(d.indices).toHaveLength((3 - 1) * (2 - 1) * 6)
    const [a, b, c] = [0, 1, 2].map((k) => Array.from(d.posiciones.slice(d.indices[k] * 3, d.indices[k] * 3 + 3)))
    const normalY = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2])
    expect(normalY).toBeGreaterThan(0)
  })

  it('una malla más gruesa tiene menos vértices', () => {
    const fina = { x0: 0, y0: 0, paso: 1, columnas: 9, filas: 9, cotas: new Array(81).fill(0) }
    const gruesa = { ...fina, paso: 2, columnas: 5, filas: 5, cotas: new Array(25).fill(0) }
    expect(geometriaTerreno(gruesa, 0).cotas.length).toBeLessThan(geometriaTerreno(fina, 0).cotas.length)
  })

  it('fraccionAltura va de 0 a 1', () => {
    expect(fraccionAltura(5, 0, 10)).toBe(0.5)
    expect(fraccionAltura(5, 5, 5)).toBe(0)
  })
})

describe('segmentosCurvas', () => {
  const curvas = [
    { cota: 3000, tipo: 'mayor' as const, puntos: [[0, 0], [10, 0], [10, 10]] as [number, number][] },
    { cota: 3001, tipo: 'menor' as const, puntos: [[0, 5], [10, 5]] as [number, number][] },
  ]
  it('solo incluye los tipos pedidos y sube las curvas un poco', () => {
    const s = segmentosCurvas(curvas, ['mayor'], 2990, 0.2)
    expect(s).toHaveLength(2 * 6)
    expect(s[1]).toBeCloseTo(10.2)
    expect(s[5]).toBe(-0)
  })
  it('omite los tramos que están del todo en terreno modificado y deja los que tocan terreno natural', () => {
    const sinPrimero = segmentosCurvas(curvas, ['mayor'], 2990, 0, ([x, y]) => x === 0 && y === 0 || x === 10 && y === 0)
    expect(sinPrimero).toHaveLength(1 * 6)
  })
  it('con todos los tipos suma todos los tramos', () => {
    expect(segmentosCurvas(curvas, ['mayor', 'menor'], 2990, 0)).toHaveLength(3 * 6)
  })
})

describe('geometriaMuro', () => {
  const plano = { x0: -10, y0: -10, paso: 20, columnas: 3, filas: 3, cotas: new Array(9).fill(50) }
  it('parte el trazo en tramos cortos', () => {
    const p = muestrearTrazo([[0, 0], [10, 0]], 2)
    expect(p).toHaveLength(6)
    expect(p[5]).toEqual([10, 0])
  })
  it('la coronación queda altura sobre el terreno y el pie baja el enterrado', () => {
    const d = geometriaMuro([[0, 0], [10, 0]], plano, 50, 0.3, 2, 0.5, 5)
    expect(d.posiciones[1]).toBeCloseTo(-0.5)
    expect(d.posiciones[4]).toBeCloseTo(2)
  })
  it('la cara interior queda a la derecha del sentido del trazo, a un espesor', () => {
    const d = geometriaMuro([[0, 0], [10, 0]], plano, 50, 0.3, 2, 0.5, 5)
    // Trazo hacia el este: la derecha es el sur, o sea z positivo en la escena.
    expect(d.posiciones[8]).toBeCloseTo(0.3)
  })
})
