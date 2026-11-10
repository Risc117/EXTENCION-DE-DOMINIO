import { describe, expect, it } from 'vitest'
import { NUMERO_PARTICULAS } from '../nucleo/constantes'
import { bufferParticulas } from './flujo'

describe('buffer de partículas', () => {
  it('tiene lugar para x, y, z y visible de cada partícula', () => {
    expect(bufferParticulas.posiciones).toHaveLength(NUMERO_PARTICULAS * 4)
  })

  it('respeta el tope acordado de 400 partículas para mantener ~30 cuadros por segundo', () => {
    expect(NUMERO_PARTICULAS).toBeLessThanOrEqual(400)
  })
})
