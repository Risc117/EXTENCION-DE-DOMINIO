import { describe, expect, it } from 'vitest'
import { manoAbierta, manoPuno } from './ejemplos'
import { centroPalma, esPuno, razonPinza, suavizar, tamanoPalma } from './reconocer'

describe('reconocimiento de gestos', () => {
  it('detecta puño y mano abierta', () => {
    expect(esPuno(manoPuno())).toBe(true)
    expect(esPuno(manoAbierta())).toBe(false)
  })

  it('la pinza crece al separar pulgar e índice', () => {
    expect(razonPinza(manoAbierta(0, 0, 0.2))).toBeGreaterThan(razonPinza(manoAbierta(0, 0, 0.05)))
  })

  it('la pinza no cambia si la mano se mueve', () => {
    expect(razonPinza(manoAbierta(0.1, -0.1))).toBeCloseTo(razonPinza(manoAbierta()))
  })

  it('la pinza no depende de qué tan cerca está la mano', () => {
    const cerca = manoAbierta()
    const lejos = cerca.map((q) => ({ x: 0.5 + (q.x - 0.5) / 2, y: 0.5 + (q.y - 0.5) / 2 }))
    expect(razonPinza(lejos)).toBeCloseTo(razonPinza(cerca))
    expect(tamanoPalma(lejos)).toBeCloseTo(tamanoPalma(cerca) / 2)
  })

  it('el centro de la palma sigue a la mano', () => {
    const a = centroPalma(manoAbierta())
    const b = centroPalma(manoAbierta(0.1, 0.05))
    expect(b.x - a.x).toBeCloseTo(0.1)
    expect(b.y - a.y).toBeCloseTo(0.05)
  })

  it('suavizar mezcla el valor previo con el nuevo', () => {
    expect(suavizar(0, 10, 0.5)).toBe(5)
    expect(suavizar(4, 4, 0.3)).toBe(4)
  })
})
