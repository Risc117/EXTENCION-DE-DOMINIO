import { describe, expect, it } from 'vitest'
import type { ParametrosFlujo } from '../estado/flujo'
import { crearAzar } from './azar'
import { avanzarParticulas, crearParticulas, escribirPosiciones, type Particula } from './particulas'

const flujo: ParametrosFlujo = { radioInterior: 3.79, alturaIngreso: 5.1, alturaSalida: 0.3, radioZonaMezcla: 1.5, alturaAgitador: 0.5 }

function una(n = 1) {
  const azar = crearAzar(7)
  return { ps: crearParticulas(n, flujo, azar), azar }
}

/** Suelta la partícula ya (sin espera) para probar su recorrido. */
function liberar(p: Particula) {
  p.espera = 0
}

describe('crearParticulas', () => {
  it('crea las partículas pedidas, todas esperando en la entrada (lado oeste, a la altura del ingreso)', () => {
    const { ps } = una(50)
    expect(ps).toHaveLength(50)
    for (const p of ps) {
      expect(p.fase).toBe(0)
      expect(p.x).toBeLessThan(0)
      expect(p.y).toBe(flujo.alturaIngreso)
    }
  })

  it('con la misma semilla salen las mismas posiciones', () => {
    const a = crearParticulas(5, flujo, crearAzar(1))
    const b = crearParticulas(5, flujo, crearAzar(1))
    expect(a).toEqual(b)
  })
})

describe('avanzarParticulas', () => {
  it('cae hasta la superficie del agua y pasa a mezclarse', () => {
    const { ps, azar } = una()
    liberar(ps[0])
    for (let i = 0; i < 200 && ps[0].fase === 0; i++) avanzarParticulas(ps, flujo, 2, 13, 13, 0.05, azar)
    expect(ps[0].fase).toBe(1)
    expect(ps[0].y).toBeCloseTo(2, 6)
  })

  it('con el tanque vacío cae hasta el fondo', () => {
    const { ps, azar } = una()
    liberar(ps[0])
    for (let i = 0; i < 200 && ps[0].fase === 0; i++) avanzarParticulas(ps, flujo, 0, 13, 13, 0.05, azar)
    expect(ps[0].y).toBe(0)
  })

  it('con caudal de entrada 0 no se sueltan ni caen', () => {
    const { ps, azar } = una(20)
    avanzarParticulas(ps, flujo, 2, 0, 13, 5, azar)
    for (const p of ps) {
      expect(p.fase).toBe(0)
      expect(p.y).toBe(flujo.alturaIngreso)
    }
  })

  it('cae más rápido con más caudal', () => {
    const lenta = una()
    const rapida = una()
    liberar(lenta.ps[0])
    liberar(rapida.ps[0])
    avanzarParticulas(lenta.ps, flujo, 0, 6.5, 13, 0.1, lenta.azar)
    avanzarParticulas(rapida.ps, flujo, 0, 26, 13, 0.1, rapida.azar)
    expect(rapida.ps[0].y).toBeLessThan(lenta.ps[0].y)
  })

  it('las que están en el agua nunca quedan por encima del nivel', () => {
    const { ps, azar } = una(100)
    for (let i = 0; i < 2000; i++) {
      avanzarParticulas(ps, flujo, 2, 13, 13, 0.05, azar)
      for (const p of ps) if (p.fase !== 0) expect(p.y).toBeLessThanOrEqual(2 + 1e-9)
    }
  })

  it('si baja el nivel, las partículas del agua bajan con él', () => {
    const { ps, azar } = una(100)
    for (let i = 0; i < 400; i++) avanzarParticulas(ps, flujo, 3, 13, 13, 0.05, azar)
    avanzarParticulas(ps, flujo, 1, 13, 13, 0.05, azar)
    for (const p of ps) if (p.fase !== 0) expect(p.y).toBeLessThanOrEqual(1 + 1e-9)
  })

  it('en la mezcla giran alrededor del agitador y se acercan a su zona', () => {
    const { ps, azar } = una()
    liberar(ps[0])
    for (let i = 0; i < 200 && ps[0].fase === 0; i++) avanzarParticulas(ps, flujo, 3, 13, 0, 0.05, azar)
    const angulo = ps[0].theta
    for (let i = 0; i < 100; i++) avanzarParticulas(ps, flujo, 3, 13, 0, 0.05, azar)
    expect(ps[0].fase).toBe(1)
    expect(ps[0].theta).toBeGreaterThan(angulo)
    expect(Math.hypot(ps[0].x, ps[0].z)).toBeLessThanOrEqual(flujo.radioZonaMezcla + 0.01)
  })

  it('recorren entrada, mezcla y salida, y vuelven a empezar', () => {
    const { ps, azar } = una()
    liberar(ps[0])
    const fases = new Set<number>()
    let llegoAlaSalida = false
    for (let i = 0; i < 4000 && !llegoAlaSalida; i++) {
      avanzarParticulas(ps, flujo, 3, 13, 13, 0.05, azar)
      fases.add(ps[0].fase)
      if (ps[0].fase === 2 && ps[0].x > 0) llegoAlaSalida = true
    }
    expect([...fases].sort()).toEqual([0, 1, 2])
    for (let i = 0; i < 4000 && ps[0].fase === 2; i++) avanzarParticulas(ps, flujo, 3, 13, 13, 0.05, azar)
    expect(ps[0].fase).toBe(0)
  })

  it('con el nivel bajo el eje de la salida igual llegan a la salida (no se quedan pegadas)', () => {
    const { ps, azar } = una()
    ps[0].fase = 2
    ps[0].x = 0
    ps[0].y = 0.1
    ps[0].z = 0
    for (let i = 0; i < 4000 && ps[0].fase === 2; i++) avanzarParticulas(ps, flujo, 0.1, 13, 13, 0.05, azar)
    expect(ps[0].fase).toBe(0)
  })

  it('con caudal de salida 0 no avanzan hacia la salida', () => {
    const { ps, azar } = una()
    ps[0].fase = 2
    ps[0].x = 0
    ps[0].y = 1
    ps[0].z = 0
    avanzarParticulas(ps, flujo, 3, 13, 0, 5, azar)
    expect(ps[0].x).toBe(0)
  })
})

describe('escribirPosiciones', () => {
  it('escribe x, y, z y si se ve; las del agua se ocultan con el tanque vacío', () => {
    const { ps } = una(2)
    liberar(ps[0])
    ps[1].fase = 1
    ps[1].espera = 0
    const salida = new Float32Array(8)
    escribirPosiciones(ps, 0, salida)
    expect(salida[3]).toBe(1)
    expect(salida[7]).toBe(0)
    escribirPosiciones(ps, 2, salida)
    expect(salida[7]).toBe(1)
    expect(salida[1]).toBeCloseTo(flujo.alturaIngreso, 5)
  })

  it('las que esperan en la entrada no se ven', () => {
    const { ps } = una(1)
    ps[0].espera = 3
    const salida = new Float32Array(4)
    escribirPosiciones(ps, 2, salida)
    expect(salida[3]).toBe(0)
  })
})
