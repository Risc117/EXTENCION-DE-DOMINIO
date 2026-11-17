import { describe, expect, it } from 'vitest'
import { medidorNivel } from './vistaNivel'

describe('barra del nivel del tanque', () => {
  it('vacío es 0 % y lleno hasta la altura total es 100 %', () => {
    expect(medidorNivel(0, 4.9, 5.4).lleno).toBe(0)
    expect(medidorNivel(5.4, 4.9, 5.4).lleno).toBe(100)
  })
  it('a media altura marca la mitad y la altura útil cae en su sitio', () => {
    const m = medidorNivel(2.7, 4.9, 5.4)
    expect(m.lleno).toBeCloseTo(50, 9)
    expect(m.marcaUtil).toBeCloseTo((4.9 / 5.4) * 100, 9)
    expect(m.sobreUtil).toBe(false)
  })
  it('avisa cuando pasa la altura útil y nunca se sale de 0 a 100 %', () => {
    expect(medidorNivel(5, 4.9, 5.4).sobreUtil).toBe(true)
    expect(medidorNivel(9, 4.9, 5.4).lleno).toBe(100)
    expect(medidorNivel(-1, 4.9, 5.4).lleno).toBe(0)
  })
  it('sin altura total no divide entre cero', () => {
    expect(medidorNivel(1, 0, 0)).toEqual({ lleno: 0, marcaUtil: 0, sobreUtil: true })
  })
})
