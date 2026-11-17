import { describe, expect, it } from 'vitest'
import type { Cuadricula } from '../../nucleo/terreno'
import { faldonTerreno } from './geometriaTerreno'

const g: Cuadricula = { x0: 0, y0: 0, paso: 3, columnas: 3, filas: 3, cotas: [10, 11, 12, 13, 14, 15, 16, 17, 18] }

describe('faldonTerreno', () => {
  it('sigue el contorno (8 nodos, 8 paredes) y baja `profundidad` bajo la cota más baja del borde', () => {
    const f = faldonTerreno(g, 5, 4)
    expect(f.posiciones.length / 3).toBe(16)
    expect(f.indices.length).toBe(8 * 6)
    const bajos = []
    for (let i = 1; i < f.posiciones.length; i += 3) bajos.push(f.posiciones[i])
    expect(Math.min(...bajos)).toBeCloseTo(10 - 4 - 5, 6)
    // cada vértice alto está a la cota del terreno en ese nodo (menos la referencia)
    expect(Math.max(...bajos)).toBeCloseTo(18 - 5, 6)
  })
})
