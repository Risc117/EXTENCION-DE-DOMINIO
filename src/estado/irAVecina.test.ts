import { beforeEach, describe, expect, it } from 'vitest'
import { DISTANCIA_INICIAL } from '../nucleo/constantesCamara'
import { useEstado } from './almacen'

const lista = [
  { id: 'bombeo', nombre: 'Bombeo' },
  { id: 'rejas', nombre: 'Rejas' },
  { id: 'rafa', nombre: 'RAFA' },
]

describe('ir a la estructura vecina (gestos y botones)', () => {
  beforeEach(() => {
    useEstado.getState().fijarUnidadesEnfocables(lista)
    useEstado.setState({ foco: null })
    useEstado.getState().fijarCamara({ acimut: 1, elevacion: 0.5, distancia: 1.2 })
  })
  it('desde la vista general, "siguiente" enfoca la primera y mantiene el ángulo con la distancia inicial', () => {
    useEstado.getState().irAVecina('siguiente')
    const s = useEstado.getState()
    expect(s.foco).toBe('bombeo')
    expect(s.camara).toEqual({ acimut: 1, elevacion: 0.5, distancia: DISTANCIA_INICIAL })
  })
  it('recorre la lista hacia delante y hacia atrás dando la vuelta', () => {
    const e = useEstado.getState()
    e.irAVecina('siguiente')
    e.irAVecina('siguiente')
    expect(useEstado.getState().foco).toBe('rejas')
    e.irAVecina('anterior')
    e.irAVecina('anterior')
    expect(useEstado.getState().foco).toBe('rafa')
  })
  it('"general" quita el foco', () => {
    useEstado.getState().irA('rafa')
    useEstado.getState().irAVecina('general')
    expect(useEstado.getState().foco).toBeNull()
  })
  it('sin estructuras no hace nada raro (foco null)', () => {
    useEstado.getState().fijarUnidadesEnfocables([])
    useEstado.getState().irAVecina('siguiente')
    expect(useEstado.getState().foco).toBeNull()
  })
})
