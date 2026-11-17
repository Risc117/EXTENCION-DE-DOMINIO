import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/sedimentador.json'
import { disponer } from './disposicion'
import { esquemaSedimentador } from './esquema'
import { puntosVertedero } from './geometria'
import { muescas } from './hidraulica'

const datos = esquemaSedimentador.parse(crudo)

describe('puntos del rebose del vertedero', () => {
  const puntos = puntosVertedero(datos)
  it('son tantos como muescas (de la hoja) y están repartidos en el círculo del muro', () => {
    expect(puntos).toHaveLength(muescas(datos))
    const s = disponer(datos)
    for (const p of puntos) expect(Math.hypot(p.x, p.z)).toBeCloseTo(s.radioMuro, 6)
  })
  it('no se repite ninguno', () => {
    expect(new Set(puntos.map((p) => `${p.x.toFixed(4)},${p.z.toFixed(4)}`)).size).toBe(puntos.length)
  })
})
