import { describe, expect, it } from 'vitest'
import { duracionCiclo, estadoEnTiempo } from './cronograma'

// Ruta de 100 m a 2 m/s: 50 s de ida y 50 s de vuelta; parada a 40 m (10 s) y al final (6 s); espera de 4 s en el origen.
const paradas = [{ d: 40, pausa: 10 }]
const opciones = { espera: 4, pausaFinal: 6 }
const e = (t: number) => estadoEnTiempo(100, paradas, 2, t, opciones)

describe('cronograma de un recorrido de ida y vuelta con paradas', () => {
  it('el ciclo suma ida, vuelta, paradas (dos pasadas), pausa final y espera', () => {
    expect(duracionCiclo(100, paradas, 2, opciones)).toBeCloseTo(50 + 50 + 10 + 10 + 6 + 4, 9)
  })
  it('espera en el origen y luego avanza', () => {
    expect(e(0)).toMatchObject({ d: 0, parado: true })
    expect(e(3.9).parado).toBe(true)
    const a = e(4 + 10)
    expect(a.d).toBeCloseTo(20, 9)
    expect(a.parado).toBe(false)
    expect(a.sentido).toBe(1)
  })
  it('se detiene en la parada durante su pausa', () => {
    expect(e(4 + 20 + 5).parado).toBe(true)
    expect(e(4 + 20 + 9).d).toBeCloseTo(40, 9)
    expect(e(4 + 20 + 10.5).parado).toBe(false)
  })
  it('llega al final, hace la pausa final y vuelve (sentido −1), parando otra vez en la parada', () => {
    const llegada = 4 + 20 + 10 + 30
    expect(e(llegada + 1).d).toBeCloseTo(100, 9)
    expect(e(llegada + 1).parado).toBe(true)
    const vuelta = e(llegada + 6 + 10)
    expect(vuelta.sentido).toBe(-1)
    expect(vuelta.d).toBeCloseTo(80, 9)
    expect(e(llegada + 6 + 30 + 5).parado).toBe(true)
  })
  it('es periódico y la fase lo adelanta en el ciclo', () => {
    const ciclo = duracionCiclo(100, paradas, 2, opciones)
    expect(e(7).d).toBeCloseTo(e(7 + ciclo).d, 9)
    const adelantado = estadoEnTiempo(100, paradas, 2, 0, { ...opciones, fase: 0.5 })
    expect(adelantado.d).toBeCloseTo(e(ciclo * 0.5).d, 9)
  })
  it('sin paradas ni esperas es una ida y vuelta continua', () => {
    expect(estadoEnTiempo(100, [], 2, 25, {}).d).toBeCloseTo(50, 9)
    expect(estadoEnTiempo(100, [], 2, 75, {}).sentido).toBe(-1)
  })
  it('oculto solo cuando espera en el origen', () => {
    expect(e(1).oculto).toBe(true)
    expect(e(20).oculto).toBe(false)
  })
})
