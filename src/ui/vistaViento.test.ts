import { describe, expect, it } from 'vitest'
import { vistaViento } from './vistaViento'

describe('indicador de viento', () => {
  it('la flecha apunta hacia donde sopla: un viento del sur (180°) apunta hacia el norte (0°)', () => {
    expect(vistaViento(3, 180).giro).toBe(0)
    expect(vistaViento(3, 270).giro).toBe(90)
    expect(vistaViento(3, 0).giro).toBe(180)
  })
  it('muestra la velocidad con un decimal y de dónde viene, en la rosa de los vientos y en grados', () => {
    const v = vistaViento(3.04, 200)
    expect(v.velocidad).toBe('3.0')
    expect(v.desde).toBe('SSO')
    expect(v.grados).toBe('200°')
  })
})
