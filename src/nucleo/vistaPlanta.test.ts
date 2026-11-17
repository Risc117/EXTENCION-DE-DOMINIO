import { describe, expect, it } from 'vitest'
import { ACIMUT_INICIAL, DISTANCIA_INICIAL, ELEVACION_INICIAL, ELEVACION_MAXIMA } from './constantesCamara'
import { camaraDePlanta, esVistaPlanta } from './vistaPlanta'

describe('vista de planta (desde arriba, como el plano)', () => {
  const planta = camaraDePlanta()
  it('mira casi vertical y con el norte hacia arriba de la pantalla (acimut 0)', () => {
    expect(planta.elevacion).toBe(ELEVACION_MAXIMA)
    expect(planta.elevacion).toBeGreaterThan(1.4)
    expect(planta.acimut).toBe(0)
    expect(planta.distancia).toBe(DISTANCIA_INICIAL)
  })
  it('se reconoce a sí misma y no reconoce la perspectiva inicial', () => {
    expect(esVistaPlanta(planta)).toBe(true)
    expect(esVistaPlanta({ acimut: ACIMUT_INICIAL, elevacion: ELEVACION_INICIAL, distancia: DISTANCIA_INICIAL })).toBe(false)
  })
  it('sigue siendo vista de planta con un pequeño movimiento (por la suavidad de la cámara) y con vueltas completas de acimut', () => {
    expect(esVistaPlanta({ ...planta, elevacion: planta.elevacion - 0.02, acimut: 0.02 })).toBe(true)
    expect(esVistaPlanta({ ...planta, acimut: 2 * Math.PI })).toBe(true)
    expect(esVistaPlanta({ ...planta, elevacion: 1.0 })).toBe(false)
    expect(esVistaPlanta({ ...planta, acimut: 1.0 })).toBe(false)
  })
})
