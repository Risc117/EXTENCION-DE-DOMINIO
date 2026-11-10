import { describe, expect, it } from 'vitest'
import crudo from '../../datos/hidrograma.json'
import type { ParametrosTanque } from '../estado/simulacion'
import { avanzar, type Condiciones, type Instante } from './avanzar'
import { crearHidrograma } from './hidrograma'

const AREA = Math.PI * 3.79 ** 2
const tanque: ParametrosTanque = { area: AREA, alturaUtil: 4.9, alturaTotal: 5.4, alturaEjeSalida: 0.3, diametroSalida: 0.16 }
const hidro = crearHidrograma(crudo)
const dia1: Condiciones = { dia: 1, modo: 'constante', ajuste: null }

/** Corre un día completo en pasos de 60 s y guarda el nivel de cada hora. */
function simularDia(cond: Condiciones) {
  let t: Instante = { hora: 0, volumen: 0 }
  const niveles: number[] = [0]
  let rebose = 0
  for (let s = 1; s <= 24 * 60; s++) {
    const r = avanzar(hidro, tanque, cond, t, 60)
    t = { hora: r.hora, volumen: r.volumen }
    rebose += r.caudalRebose
    if (s % 60 === 0) niveles.push(r.nivel)
  }
  return { niveles, rebose }
}

describe('avanzar', () => {
  it('avanza la hora y vuelve a 0 a las 24 h', () => {
    const r = avanzar(hidro, tanque, dia1, { hora: 23.5, volumen: 0 }, 3600)
    expect(r.hora).toBeCloseTo(0.5, 6)
  })

  it('empezando vacío, el nivel no se mueve de noche, sube de día y baja al final (coherente con el hidrograma)', () => {
    const { niveles, rebose } = simularDia(dia1)
    expect(niveles[5]).toBe(0)
    expect(niveles[12]).toBeGreaterThan(niveles[8])
    const pico = Math.max(...niveles)
    const horaPico = niveles.indexOf(pico)
    expect(horaPico).toBeGreaterThanOrEqual(17)
    expect(horaPico).toBeLessThanOrEqual(20)
    // Se requieren ≈ 226 m³ (más que los 221 m³ útiles): el pico pasa un poco de 4.9 m pero no llega a rebosar (5.4 m).
    expect(pico).toBeCloseTo(225.8 / AREA, 1)
    expect(pico).toBeGreaterThan(tanque.alturaUtil)
    expect(pico).toBeLessThan(tanque.alturaTotal)
    expect(niveles[24]).toBeLessThan(pico)
    expect(rebose).toBe(0)
  })

  it('con poca salida el tanque se llena y rebosa', () => {
    const { niveles, rebose } = simularDia({ dia: 1, modo: 'constante', ajuste: 2 })
    expect(Math.max(...niveles)).toBeCloseTo(5.4, 6)
    expect(rebose).toBeGreaterThan(0)
  })

  it('modo gravedad: la salida crece con el nivel y con el tanque vacío es 0', () => {
    const grav: Condiciones = { dia: 1, modo: 'gravedad', ajuste: null }
    const bajo = avanzar(hidro, tanque, grav, { hora: 12, volumen: AREA * 1 }, 1)
    const alto = avanzar(hidro, tanque, grav, { hora: 12, volumen: AREA * 4 }, 1)
    expect(alto.caudalSalida).toBeGreaterThan(bajo.caudalSalida)
    const vacio = avanzar(hidro, tanque, grav, { hora: 12, volumen: 0 }, 1)
    expect(vacio.caudalSalida).toBeCloseTo(0, 6)
  })
})
