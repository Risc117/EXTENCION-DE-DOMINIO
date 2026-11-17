import { describe, expect, it } from 'vitest'
import { datosVR } from '../../nucleo/vr/datos'
import { entorno } from '../../unidades/entorno/datos'
import { inicioDeVR } from './inicioVR'

describe('dónde empieza la persona en VR', () => {
  const via = entorno.vias.find((v) => v.id === datosVR.inicio.via)!
  const inicio = inicioDeVR(entorno.vias, datosVR.inicio)
  it('empieza en el primer punto de la vía interna (la entrada), en ejes de la escena (x, z = −y)', () => {
    expect(inicio.x).toBe(via.eje[0].x)
    expect(inicio.z).toBe(-via.eje[0].y)
  })
  it('mira hacia el punto de la vía que dice el dato (hacia dentro de la planta)', () => {
    const hacia = via.eje[datosVR.inicio.haciaIndice]
    const [dx, dz] = [hacia.x - inicio.x, -hacia.y - inicio.z]
    // dirección con rumbo yaw: (−sin yaw, −cos yaw)
    const largo = Math.hypot(dx, dz)
    expect(-Math.sin(inicio.yaw)).toBeCloseTo(dx / largo, 9)
    expect(-Math.cos(inicio.yaw)).toBeCloseTo(dz / largo, 9)
  })
  it('una vía que no existe falla con un mensaje claro', () => {
    expect(() => inicioDeVR(entorno.vias, { ...datosVR.inicio, via: 'no-existe' })).toThrow(/no-existe/)
  })
  it('un índice fuera de la vía falla con un mensaje claro', () => {
    expect(() => inicioDeVR(entorno.vias, { ...datosVR.inicio, haciaIndice: 9999 })).toThrow(/9999/)
  })
})
