import { describe, expect, it } from 'vitest'
import { datosVR, esquemaVR } from './datos'

describe('datos de VR', () => {
  it('todas las medidas son Dato de ejemplo y traen fuente', () => {
    for (const m of [datosVR.alturaOjos, datosVR.separacionOjos, datosVR.tiempoMirada, datosVR.anguloSalir, datosVR.distanciaMaxima, datosVR.campoVision]) {
      expect(m.demo).toBe(true)
      expect(m.fuente).toContain('No está en las fuentes')
    }
    expect(datosVR.demo).toBe(true)
  })
  it('traen los valores típicos: ojos a 1.6 m, separación de 6.4 cm, mirada de 1.8 s', () => {
    expect(datosVR.alturaOjos.valor).toBe(1.6)
    expect(datosVR.separacionOjos.valor).toBe(0.064)
    expect(datosVR.tiempoMirada.valor).toBe(1.8)
  })
  it('el esquema rechaza un ángulo de salida de 90° o más, una altura en cero y una medida sin fuente', () => {
    const a = structuredClone(datosVR)
    a.anguloSalir.valor = 90
    expect(esquemaVR.safeParse(a).success).toBe(false)
    const b = structuredClone(datosVR)
    b.alturaOjos.valor = 0
    expect(esquemaVR.safeParse(b).success).toBe(false)
    const c = structuredClone(datosVR)
    c.tiempoMirada.fuente = ''
    expect(esquemaVR.safeParse(c).success).toBe(false)
  })
})
