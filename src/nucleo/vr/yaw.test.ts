import { describe, expect, it } from 'vitest'
import { Quaternion, Vector3 } from 'three'
import { cuaternionDeDispositivo, cuaternionManual, girarYaw, yawDeCuaternion } from './orientacion'

const mira = (q: [number, number, number, number]) => new Vector3(0, 0, -1).applyQuaternion(new Quaternion(...q))

describe('rumbo (yaw) de la cámara', () => {
  it('mirando al norte (−z) es 0; a la izquierda (−x) es +90°; a la derecha (+x) es −90°', () => {
    expect(yawDeCuaternion(cuaternionManual(0, 0))).toBeCloseTo(0, 9)
    expect(yawDeCuaternion(cuaternionManual(Math.PI / 2, 0))).toBeCloseTo(Math.PI / 2, 9)
    expect(yawDeCuaternion(cuaternionManual(-Math.PI / 2, 0))).toBeCloseTo(-Math.PI / 2, 9)
  })
  it('no depende del cabeceo (mirar arriba o abajo mantiene el rumbo)', () => {
    expect(yawDeCuaternion(cuaternionManual(0.7, 0.4))).toBeCloseTo(0.7, 9)
    expect(yawDeCuaternion(cuaternionManual(0.7, -0.4))).toBeCloseTo(0.7, 9)
  })
  it('lee el rumbo del giroscopio: alpha 90 con el celular de pie mira a la izquierda', () => {
    expect(yawDeCuaternion(cuaternionDeDispositivo(90, 90, 0, 0))).toBeCloseTo(Math.PI / 2, 6)
  })
})

describe('girar el rumbo para alinear el giroscopio con la entrada de la planta', () => {
  it('sumar un giro cambia el rumbo en ese ángulo y no cambia el cabeceo', () => {
    const q = cuaternionDeDispositivo(30, 100, 0, 0)
    const antes = mira(q)
    const girado = girarYaw(q, 0.5)
    expect(yawDeCuaternion(girado)).toBeCloseTo(yawDeCuaternion(q) + 0.5, 6)
    expect(mira(girado).y).toBeCloseTo(antes.y, 6)
  })
  it('alinear: con el rumbo de entrada deseado, el giroscopio queda mirando hacia ahí', () => {
    const deseado = -0.8
    const q = cuaternionDeDispositivo(200, 90, 0, 0)
    const alineado = girarYaw(q, deseado - yawDeCuaternion(q))
    expect(yawDeCuaternion(alineado)).toBeCloseTo(deseado, 6)
  })
})
