import { describe, expect, it } from 'vitest'
import { filtrarPorCalidad, quedaCortado, tapaElTanque } from './visibilidad'

const R = 3.99
const Y_MIN = 0
const Y_MAX = 5.55

describe('quedaCortado', () => {
  it('sin corte nada queda cortado', () => {
    expect(quedaCortado([0, 1, 3], false, 0, 3.79)).toBe(false)
  })
  it('con corte se oculta lo que está del lado +z del plano', () => {
    expect(quedaCortado([0, 1, 1], true, 0, 3.79)).toBe(true)
    expect(quedaCortado([0, 1, -1], true, 0, 3.79)).toBe(false)
    expect(quedaCortado([0, 1, 1], true, 0.5, 3.79)).toBe(false)
  })
})

describe('tapaElTanque', () => {
  const camara: [number, number, number] = [20, 8, 0]
  it('una pieza al otro lado del tanque queda tapada', () => {
    expect(tapaElTanque(camara, [-5, 5, 0], R, Y_MIN, Y_MAX)).toBe(true)
  })
  it('una pieza del lado de la cámara se ve', () => {
    expect(tapaElTanque(camara, [5, 5, 0], R, Y_MIN, Y_MAX)).toBe(false)
  })
  it('una pieza al costado, que la cámara ve de lado, se ve', () => {
    expect(tapaElTanque(camara, [0, 5, 8], R, Y_MIN, Y_MAX)).toBe(false)
  })
  it('una pieza sobre la losa de techo se ve desde arriba', () => {
    expect(tapaElTanque([0, 20, 0.1], [0, 6.5, 3], R, Y_MIN, Y_MAX)).toBe(false)
  })
  it('con la cámara pegada al suelo, algo del otro lado del techo queda tapado', () => {
    expect(tapaElTanque([20, 1, 0], [-3, 5.4, 0], R, Y_MIN, Y_MAX)).toBe(true)
  })
})

describe('filtrarPorCalidad', () => {
  const lista = [{ id: 'a', prioridad: true }, { id: 'b' }, { id: 'c', prioridad: false }]
  it('en calidad alta se muestran todas', () => {
    expect(filtrarPorCalidad(lista, 'alta')).toHaveLength(3)
  })
  it('en calidad baja solo las principales', () => {
    expect(filtrarPorCalidad(lista, 'baja').map((x) => x.id)).toEqual(['a'])
  })
})
