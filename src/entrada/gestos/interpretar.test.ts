import { describe, expect, it } from 'vitest'
import { AJUSTE_GESTOS_DEFECTO, CUADROS_PUNO } from '../../nucleo/constantes'
import { manoAbierta, manoPuno } from './ejemplos'
import { interpretar, type Memoria } from './interpretar'
import type { Punto } from './puntos'

function correr(cuadros: (Punto[] | null)[], ajuste = AJUSTE_GESTOS_DEFECTO) {
  let memoria: Memoria | null = null
  let ultimo = interpretar(null, null)
  for (const c of cuadros) {
    ultimo = interpretar(memoria, c, ajuste)
    memoria = ultimo.memoria
  }
  return ultimo
}

const QUIETO = { acimut: 0, elevacion: 0 }

describe('interpretar un cuadro', () => {
  it('sin mano no hay intenciones ni memoria', () => {
    expect(interpretar(null, null)).toEqual({ memoria: null, giro: QUIETO, zoom: 1, pausa: false, detectada: false })
  })

  it('el primer cuadro no gira (no hay referencia)', () => {
    const r = interpretar(null, manoAbierta())
    expect(r.detectada).toBe(true)
    expect(r.giro).toEqual(QUIETO)
    expect(r.zoom).toBe(1)
  })

  it('mano quieta no genera giro ni zoom', () => {
    const r = correr([manoAbierta(), manoAbierta(), manoAbierta()])
    expect(r.giro).toEqual(QUIETO)
    expect(r.zoom).toBe(1)
  })

  it('mover la palma de lado gira; hacia abajo cambia la elevación', () => {
    const lado = correr([manoAbierta(), manoAbierta(0.1, 0)])
    expect(lado.giro.acimut).toBeGreaterThan(0)
    expect(lado.giro.elevacion).toBe(0)
    const abajo = correr([manoAbierta(), manoAbierta(0, 0.1)])
    expect(abajo.giro.elevacion).toBeGreaterThan(0)
  })

  it('abrir la pinza acerca (zoom < 1) y cerrarla aleja (zoom > 1)', () => {
    expect(correr([manoAbierta(0, 0, 0.05), manoAbierta(0, 0, 0.2)]).zoom).toBeLessThan(1)
    expect(correr([manoAbierta(0, 0, 0.2), manoAbierta(0, 0, 0.05)]).zoom).toBeGreaterThan(1)
  })

  it('el puño pausa tras varios cuadros y no gira ni hace zoom', () => {
    const r = correr([manoAbierta(), ...Array(CUADROS_PUNO).fill(manoPuno())])
    expect(r.pausa).toBe(true)
    expect(r.giro).toEqual(QUIETO)
    expect(r.zoom).toBe(1)
  })

  it('un solo cuadro de puño no pausa (evita parpadeos)', () => {
    expect(correr([manoAbierta(), manoPuno()]).pausa).toBe(false)
  })

  it('abrir la mano después del puño quita la pausa sin saltos', () => {
    const r = correr([manoPuno(), manoPuno(), manoPuno(), manoPuno(), manoAbierta()])
    expect(r.pausa).toBe(false)
    expect(r.giro).toEqual(QUIETO)
    expect(r.zoom).toBe(1)
  })

  it('al perder la mano se olvida la referencia', () => {
    const r = correr([manoAbierta(), null, manoAbierta(0.3, 0)])
    expect(r.giro).toEqual(QUIETO)
  })
})

describe('ajuste de gestos', () => {
  it('con los valores por defecto un temblor leve no mueve la cámara', () => {
    const r = correr([manoAbierta(), manoAbierta(0.005, 0.005)])
    expect(r.giro).toEqual(QUIETO)
    expect(r.zoom).toBe(1)
  })

  it('más sensibilidad de giro gira más', () => {
    const base = correr([manoAbierta(), manoAbierta(0.1, 0)])
    const mas = correr([manoAbierta(), manoAbierta(0.1, 0)], { ...AJUSTE_GESTOS_DEFECTO, giro: AJUSTE_GESTOS_DEFECTO.giro * 2 })
    expect(mas.giro.acimut).toBeCloseTo(base.giro.acimut * 2)
  })

  it('más sensibilidad de zoom cambia más la distancia', () => {
    const base = correr([manoAbierta(0, 0, 0.05), manoAbierta(0, 0, 0.2)])
    const mas = correr([manoAbierta(0, 0, 0.05), manoAbierta(0, 0, 0.2)], { ...AJUSTE_GESTOS_DEFECTO, zoom: AJUSTE_GESTOS_DEFECTO.zoom * 2 })
    expect(mas.zoom).toBeLessThan(base.zoom)
  })

  it('más suavizado reduce el movimiento por cuadro', () => {
    const base = correr([manoAbierta(), manoAbierta(0.1, 0)])
    const suave = correr([manoAbierta(), manoAbierta(0.1, 0)], { ...AJUSTE_GESTOS_DEFECTO, suavizado: 0.9 })
    expect(suave.giro.acimut).toBeLessThan(base.giro.acimut)
  })

  it('una zona muerta mayor ignora movimientos que antes contaban', () => {
    const movimiento = [manoAbierta(), manoAbierta(0.04, 0)]
    expect(correr(movimiento).giro.acimut).toBeGreaterThan(0)
    expect(correr(movimiento, { ...AJUSTE_GESTOS_DEFECTO, zonaMuerta: 0.02 }).giro).toEqual(QUIETO)
  })
})
