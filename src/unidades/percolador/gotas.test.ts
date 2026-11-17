import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/percolador.json'
import { disponer } from './disposicion'
import { esquemaPercolador } from './esquema'
import { puntosGotasBrazos } from './geometria'

const datos = esquemaPercolador.parse(crudo)

describe('puntos de caída de las gotas del percolador', () => {
  const puntos = puntosGotasBrazos(datos, 6)
  const s = disponer(datos)
  it('hay los mismos en cada brazo', () => {
    expect(puntos).toHaveLength(datos.distribuidor.cantidadBrazos.valor * 6)
  })
  it('caen sobre los brazos: entre la columna y el muro', () => {
    for (const p of puntos) {
      const r = Math.hypot(p.x, p.z)
      expect(r).toBeGreaterThan(s.radioColumna)
      expect(r).toBeLessThan(s.radio)
    }
  })
})
