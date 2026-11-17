import { describe, expect, it } from 'vitest'
import { ventanasEstereo } from './estereo'

describe('pantalla partida para el visor', () => {
  it('divide la pantalla en dos mitades iguales, ojo izquierdo y derecho', () => {
    const [izq, der] = ventanasEstereo(1280, 720)
    expect(izq).toEqual({ x: 0, y: 0, ancho: 640, alto: 720 })
    expect(der).toEqual({ x: 640, y: 0, ancho: 640, alto: 720 })
  })
  it('cada ojo tiene su propio aspecto (ancho de la mitad entre el alto)', () => {
    const [izq, der] = ventanasEstereo(1280, 720)
    expect(izq.ancho / izq.alto).toBeCloseTo(640 / 720, 9)
    expect(der.ancho / der.alto).toBeCloseTo(640 / 720, 9)
  })
  it('con un ancho impar no deja hueco ni se pisan', () => {
    const [izq, der] = ventanasEstereo(1281, 600)
    expect(izq.x + izq.ancho).toBe(der.x)
    expect(der.x + der.ancho).toBe(1281)
  })
})
