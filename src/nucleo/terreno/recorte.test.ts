import { describe, expect, it } from 'vitest'
import { alturaEn, type Cuadricula } from './altura'
import { recortarCuadricula, recortarSegmento, ventanaDe } from './recorte'

// Malla de 11 × 11 nodos cada 3 m (0 a 30 m); la cota de cada nodo es columna + 100 × fila.
const malla = (): Cuadricula => ({ x0: 0, y0: 0, paso: 3, columnas: 11, filas: 11, cotas: Array.from({ length: 121 }, (_, i) => (i % 11) + 100 * Math.floor(i / 11)) })

describe('ventanaDe', () => {
  it('es la caja que envuelve los puntos, más el margen', () => {
    expect(ventanaDe([[0, 0], [10, -4], [-2, 7]], 5)).toEqual({ xMin: -7, xMax: 15, yMin: -9, yMax: 12 })
  })
})

describe('recortarCuadricula', () => {
  it('corta en nodos enteros, deja afuera todo lo que no está en la ventana y conserva las cotas', () => {
    const g = recortarCuadricula(malla(), { xMin: 5, xMax: 20, yMin: 4, yMax: 13 })
    expect([g.x0, g.y0, g.columnas, g.filas]).toEqual([3, 3, 7, 5])
    expect(g.cotas[0]).toBe(1 + 100)
    expect(alturaEn(g, 6, 6)).toBeCloseTo(alturaEn(malla(), 6, 6)!, 9)
    expect(alturaEn(g, 1, 6)).toBeNull()
    expect(alturaEn(g, 6, 20)).toBeNull()
  })
  it('no pasa de los límites de la malla y siempre deja al menos 2 × 2 nodos', () => {
    const g = recortarCuadricula(malla(), { xMin: -100, xMax: 500, yMin: -100, yMax: 500 })
    expect([g.x0, g.y0, g.columnas, g.filas]).toEqual([0, 0, 11, 11])
    const chico = recortarCuadricula(malla(), { xMin: 10, xMax: 10.5, yMin: 10, yMax: 10.5 })
    expect(chico.columnas).toBeGreaterThanOrEqual(2)
    expect(chico.filas).toBeGreaterThanOrEqual(2)
  })
})

describe('recortarSegmento', () => {
  const v = { xMin: 0, xMax: 10, yMin: 0, yMax: 10 }
  it('deja igual lo que está dentro, corta en el borde lo que sale y descarta lo de afuera', () => {
    expect(recortarSegmento([2, 2], [8, 8], v)).toEqual([[2, 2], [8, 8]])
    expect(recortarSegmento([5, 5], [15, 5], v)).toEqual([[5, 5], [10, 5]])
    expect(recortarSegmento([-5, 5], [15, 5], v)).toEqual([[0, 5], [10, 5]])
    expect(recortarSegmento([12, 0], [20, 9], v)).toBeNull()
  })
})
