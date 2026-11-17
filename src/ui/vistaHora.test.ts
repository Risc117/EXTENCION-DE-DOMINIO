import { describe, expect, it } from 'vitest'
import { posicionSol } from '../nucleo/solar'
import { textoHora, vistaHora } from './vistaHora'

const elevacion = (h: number) => posicionSol(-10.9295, 11, 15, h).elevacion

describe('hora del día en el panel', () => {
  it('da la hora como HH:MM', () => {
    expect(textoHora(7.5)).toBe('07:30')
    expect(textoHora(0)).toBe('00:00')
    expect(textoHora(23.99)).toBe('23:59')
    expect(textoHora(24)).toBe('00:00')
  })
  it('a mediodía es de día con las luces apagadas', () => {
    const v = vistaHora(12, elevacion(12))
    expect(v.momento).toBe('Día')
    expect(v.luces).toBe('apagadas')
    expect(v.altura).toBe('82°')
  })
  it('de noche las luces están encendidas', () => {
    const v = vistaHora(22, elevacion(22))
    expect(v.momento).toBe('Noche')
    expect(v.luces).toBe('encendidas')
  })
  it('al amanecer es el crepúsculo', () => {
    expect(vistaHora(5.5, elevacion(5.5)).momento).toBe('Amanecer o atardecer')
  })
})
