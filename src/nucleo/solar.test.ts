import { describe, expect, it } from 'vitest'
import { diaDelAnio, direccionAlSol, lucesEncendidas, luzDelDia, posicionSol } from './solar'
import { utmSurAGeograficas } from './utm'

// Picoy: latitud −10.9295°, 15 de noviembre.
const sol = (hora: number) => posicionSol(-10.9295, 11, 15, hora)

describe('posición del sol', () => {
  it('el día del año se cuenta desde el 1 de enero', () => {
    expect(diaDelAnio(1, 1)).toBe(1)
    expect(diaDelAnio(11, 15)).toBe(319)
    expect(diaDelAnio(12, 31)).toBe(365)
  })
  it('a mediodía el sol está más alto que a las 7 am', () => {
    expect(sol(12).elevacion).toBeGreaterThan(sol(7).elevacion)
    expect(sol(7).elevacion).toBeGreaterThan(0)
  })
  it('al mediodía solar de esa fecha y latitud queda a ≈ 82° de altura (±1°)', () => {
    expect(sol(12).elevacion).toBeGreaterThan(81)
    expect(sol(12).elevacion).toBeLessThan(83)
  })
  it('sale por el este y se pone por el oeste; de noche está bajo el horizonte', () => {
    expect(sol(6).acimut).toBeGreaterThan(60)
    expect(sol(6).acimut).toBeLessThan(120)
    expect(sol(18).acimut).toBeGreaterThan(240)
    expect(sol(18).acimut).toBeLessThan(300)
    expect(sol(0).elevacion).toBeLessThan(-55)
    expect(sol(3).elevacion).toBeLessThan(0)
    expect(sol(22).elevacion).toBeLessThan(0)
  })
  it('es simétrica: a la misma distancia del mediodía, la misma altura', () => {
    expect(sol(9).elevacion).toBeCloseTo(sol(15).elevacion, 6)
  })
  it('el sol del mediodía está casi arriba y al este de la mañana queda hacia +x de la escena (z es el sur)', () => {
    expect(direccionAlSol(sol(12))[1]).toBeGreaterThan(0.98)
    expect(direccionAlSol(sol(8))[0]).toBeGreaterThan(0)
    expect(direccionAlSol(sol(16))[0]).toBeLessThan(0)
    const v = direccionAlSol(sol(10))
    expect(Math.hypot(...v)).toBeCloseTo(1, 9)
  })
})

describe('luz del día', () => {
  it('el sol ilumina más a mediodía que a las 7 am y nada de noche', () => {
    expect(luzDelDia(sol(12).elevacion).sol).toBeGreaterThan(luzDelDia(sol(7).elevacion).sol)
    expect(luzDelDia(sol(22).elevacion).sol).toBe(0)
  })
  it('de noche el cielo es oscuro con estrellas; de día claro sin estrellas; el ambiente nunca es cero', () => {
    const [noche, dia] = [luzDelDia(-40), luzDelDia(70)]
    expect(noche.dia).toBe(0)
    expect(noche.estrellas).toBe(1)
    expect(dia.dia).toBe(1)
    expect(dia.estrellas).toBe(0)
    expect(noche.ambiente).toBeGreaterThan(0)
    expect(dia.ambiente).toBeGreaterThan(noche.ambiente)
  })
  it('la transición es gradual: al amanecer la mezcla va entre 0 y 1', () => {
    const m = luzDelDia(0).dia
    expect(m).toBeGreaterThan(0)
    expect(m).toBeLessThan(1)
  })
  it('de noche las luces están encendidas y de día apagadas', () => {
    expect(lucesEncendidas(sol(22).elevacion)).toBe(true)
    expect(lucesEncendidas(sol(3).elevacion)).toBe(true)
    expect(lucesEncendidas(sol(12).elevacion)).toBe(false)
    expect(lucesEncendidas(sol(8).elevacion)).toBe(false)
  })
})

describe('de UTM a latitud y longitud', () => {
  it('el meridiano central de la zona 18 (este 500000) es −75° y a la altura del ecuador (norte 10 000 000) la latitud es 0', () => {
    const p = utmSurAGeograficas(500000, 10000000, 18)
    expect(p.latitud).toBeCloseTo(0, 6)
    expect(p.longitud).toBeCloseTo(-75, 6)
  })
  it('el origen de la planta cae en Picoy (≈ −10.93°, −76.74°)', () => {
    const p = utmSurAGeograficas(309340, 8791260, 18)
    expect(p.latitud).toBeCloseTo(-10.9295, 3)
    expect(p.longitud).toBeCloseTo(-76.7446, 3)
  })
})
