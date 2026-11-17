import { describe, expect, it } from 'vitest'
import { avanzarMirada, claseDeMirada, MIRADA_INICIAL, type EstadoMirada } from './mirada'

const UMBRAL = 1.8

function correr(pasos: { clave: string | null; dt: number; tocar?: boolean }[]) {
  let e: EstadoMirada = MIRADA_INICIAL
  return pasos.map((p) => {
    const r = avanzarMirada(e, p.clave, p.dt, UMBRAL, p.tocar)
    e = r.estado
    return r
  })
}

describe('mira central: mantener la mirada para actuar', () => {
  it('avanza con el tiempo y dispara una sola vez al llegar al umbral', () => {
    const r = correr(Array.from({ length: 30 }, () => ({ clave: 'suelo', dt: 0.1 })))
    expect(r.filter((x) => x.disparar)).toHaveLength(1)
    expect(r[0].progreso).toBeCloseTo(0, 9)
    expect(r[8].progreso).toBeCloseTo(0.8 / UMBRAL, 6)
    expect(r.findIndex((x) => x.disparar)).toBe(18)
    expect(r[29].progreso).toBe(1)
  })
  it('si cambia lo que se mira, reinicia; si se mira a nada, reinicia', () => {
    const r = correr([
      { clave: 'rafa', dt: 1.5 },
      { clave: 'suelo', dt: 0.5 },
      { clave: 'suelo', dt: 0.5 },
      { clave: null, dt: 0.1 },
      { clave: 'suelo', dt: 0.5 },
    ])
    expect(r.every((x) => !x.disparar)).toBe(true)
    expect(r[1].progreso).toBe(0)
    expect(r[3].progreso).toBe(0)
    expect(r[4].progreso).toBe(0)
  })
  it('después de actuar no repite mientras se siga mirando lo mismo, pero sí al mirar otra cosa y volver', () => {
    const r = correr([
      { clave: 'rafa', dt: 2 },
      { clave: 'rafa', dt: 2 },
      { clave: null, dt: 0.1 },
      { clave: 'rafa', dt: 0.1 },
      { clave: 'rafa', dt: 2 },
    ])
    expect(r.map((x) => x.disparar)).toEqual([false, true, false, false, true])
    expect(r[1].progreso).toBe(1)
  })
  it('tocar la pantalla actúa de inmediato sobre lo que se mira, cada vez que se toca, y nunca sobre nada', () => {
    const r = correr([
      { clave: 'rafa', dt: 0.1, tocar: true },
      { clave: 'rafa', dt: 0.1, tocar: true },
      { clave: null, dt: 0.1, tocar: true },
    ])
    expect(r.map((x) => x.disparar)).toEqual([true, true, false])
  })
})

describe('qué se está mirando', () => {
  it('casi vertical hacia abajo es "salir"; antes de ese ángulo, lo que haya', () => {
    expect(claseDeMirada([0, -1, 0], null, null, 70)).toBe('salir')
    expect(claseDeMirada([0, -0.95, -0.31], 'rafa', null, 70)).toBe('salir')
    expect(claseDeMirada([0, -0.7, -0.7], 'rafa', null, 70)).toBe('unidad:rafa')
  })
  it('una estructura gana sobre el suelo; el suelo cuenta si hay punto; si no hay nada, ninguna', () => {
    expect(claseDeMirada([0, -0.2, -1], 'rafa', { x: 1, z: 2 }, 70)).toBe('unidad:rafa')
    expect(claseDeMirada([0, -0.2, -1], null, { x: 1, z: 2 }, 70)).toBe('suelo')
    expect(claseDeMirada([0, 0.5, -1], null, null, 70)).toBeNull()
  })
})

describe('tocar y la espera juntos', () => {
  it('después de tocar, seguir mirando lo mismo no vuelve a disparar solo por la espera', () => {
    const r = correr([
      { clave: 'suelo', dt: 0.1, tocar: true },
      { clave: 'suelo', dt: 2 },
      { clave: 'suelo', dt: 2 },
    ])
    expect(r.map((x) => x.disparar)).toEqual([true, false, false])
  })
  it('tocar varias veces seguidas sobre el suelo camina cada vez', () => {
    const r = correr([
      { clave: 'suelo', dt: 0.1, tocar: true },
      { clave: 'suelo', dt: 0.1, tocar: true },
      { clave: 'suelo', dt: 0.1, tocar: true },
    ])
    expect(r.every((x) => x.disparar)).toBe(true)
  })
})
