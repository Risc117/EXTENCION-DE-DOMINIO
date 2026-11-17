import { describe, expect, it } from 'vitest'
import { posicionSol } from '../nucleo/solar'
import { franjaDelDia, luzPorTramo, textoHora, vistaHora } from './vistaHora'

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

describe('franja de día y noche bajo el deslizador', () => {
  const luz = luzPorTramo(-10.9295, 11, 15, 24)
  it('hay un valor por hora más el cierre, de noche en los extremos y de día al mediodía', () => {
    expect(luz).toHaveLength(25)
    expect(luz[0]).toBe(0)
    expect(luz[24]).toBe(0)
    expect(luz[12]).toBe(1)
  })
  it('amanece antes de las 7 y anochece después de las 17 (Picoy, noviembre)', () => {
    expect(luz[7]).toBe(1)
    expect(luz[17]).toBe(1)
    expect(luz[4]).toBe(0)
    expect(luz[20]).toBe(0)
  })
  it('el degradado usa solo los colores del cielo y va de 0 % a 100 %', () => {
    const css = franjaDelDia([0, 1, 0])
    expect(css).toMatch(/^linear-gradient\(90deg, /)
    expect(css).toContain('var(--color-cielo-dia) 0%, var(--color-cielo-noche)) 0.0%')
    expect(css).toContain('var(--color-cielo-dia) 100%, var(--color-cielo-noche)) 50.0%')
    expect(css).toContain('100.0%')
    expect(css).not.toMatch(/#[0-9a-f]{3,6}/i)
  })
})
