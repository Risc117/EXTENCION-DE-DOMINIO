import { describe, expect, it } from 'vitest'
import { Quaternion, Vector3 } from 'three'
import { cuaternionDeDispositivo, cuaternionManual } from './orientacion'

const mira = (q: [number, number, number, number]): number[] => new Vector3(0, 0, -1).applyQuaternion(new Quaternion(...q)).toArray().map((x) => Math.round(x * 1000) / 1000 + 0)

describe('orientación del celular → cámara (giroscopio)', () => {
  it('de pie y mirando al frente (beta 90) la cámara mira al horizonte, hacia −z (el norte de la escena)', () => {
    expect(mira(cuaternionDeDispositivo(0, 90, 0, 0))).toEqual([0, 0, -1])
  })
  it('girar el celular a la izquierda (alpha crece) gira la cámara a la izquierda', () => {
    expect(mira(cuaternionDeDispositivo(90, 90, 0, 0))).toEqual([-1, 0, 0])
    expect(mira(cuaternionDeDispositivo(270, 90, 0, 0))).toEqual([1, 0, 0])
  })
  it('con el celular plano boca arriba la cámara mira hacia abajo', () => {
    expect(mira(cuaternionDeDispositivo(0, 0, 0, 0))).toEqual([0, -1, 0])
  })
  it('inclinar el celular hacia atrás (beta 135) mira hacia arriba', () => {
    const [, y] = mira(cuaternionDeDispositivo(0, 135, 0, 0))
    expect(y).toBeGreaterThan(0.5)
  })
  it('en horizontal (visor Cardboard) también mira al horizonte, y la pantalla compensa el giro', () => {
    expect(mira(cuaternionDeDispositivo(0, 0, -90, 90))).toEqual([1, 0, 0])
    expect(mira(cuaternionDeDispositivo(0, 0, 90, 270))).toEqual([-1, 0, 0])
  })
  it('devuelve un cuaternión unitario', () => {
    const q = cuaternionDeDispositivo(33, 71, -12, 90)
    expect(Math.hypot(...q)).toBeCloseTo(1, 9)
  })
})

describe('mirar arrastrando (sin giroscopio)', () => {
  it('sin giro mira al norte (−z)', () => {
    expect(mira(cuaternionManual(0, 0))).toEqual([0, 0, -1])
  })
  it('arrastrar a la derecha (yaw negativo) mira a la derecha y hacia arriba o abajo con el cabeceo', () => {
    expect(mira(cuaternionManual(-Math.PI / 2, 0))).toEqual([1, 0, 0])
    expect(mira(cuaternionManual(0, -Math.PI / 2))).toEqual([0, -1, 0])
  })
})
