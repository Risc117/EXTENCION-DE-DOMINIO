import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/bombeo.json'
import { disponer } from './disposicion'
import { esquemaBombeo } from './esquema'
import { construirAguas, construirPiezas } from './geometria'

const datos = esquemaBombeo.parse(crudo)

describe('estación de bombeo', () => {
  it('el cárcamo mide Ø 3.20 m y tiene dos bombas (1+1R), como dice el plano', () => {
    expect(datos.carcamo.diametroInterior.valor).toBe(3.2)
    expect(datos.bombas.cantidad.valor).toBe(2)
    expect(disponer(datos).zBombas).toHaveLength(2)
  })

  it('solo la bomba en marcha se pinta de verde', () => {
    const color = (activa: number | null, i: number) => construirPiezas(datos, activa).find((p) => p.id === `bomba-${i}`)!.color
    expect(color(0, 0)).toBe('--color-bomba-marcha')
    expect(color(0, 1)).toBe('--color-bomba-parada')
    expect(color(null, 0)).toBe('--color-bomba-parada')
  })

  it('las bombas caben dentro del cárcamo y apoyan en el fondo', () => {
    const s = disponer(datos)
    for (const p of construirPiezas(datos, null).filter((x) => x.id.startsWith('bomba-'))) {
      expect(Math.hypot(p.pos[0], p.pos[2]) + datos.bombas.diametro.valor / 2).toBeLessThan(s.radioInterior)
      expect(p.forma === 'cilindro' && p.pos[1] - p.alto / 2).toBeCloseTo(0, 9)
    }
  })

  it('el agua del cárcamo sube con el nivel y no pasa del borde', () => {
    expect(construirAguas(datos, 1.2)[0].nivel).toBe(1.2)
    expect(construirAguas(datos, 99)[0].nivel).toBe(datos.carcamo.profundidad.valor)
  })

  it('rechaza arranque bajo la parada, y una sola bomba', () => {
    const alReves = structuredClone(crudo)
    alReves.niveles.arranque.valor = 0.3
    expect(esquemaBombeo.safeParse(alReves).success).toBe(false)
    const una = structuredClone(crudo)
    una.bombas.cantidad.valor = 1
    expect(esquemaBombeo.safeParse(una).success).toBe(false)
  })

  it('la impulsión mide Ø 200 mm y corre sobre el terreno', () => {
    const s = disponer(datos)
    const tubo = construirPiezas(datos, null).find((p) => p.id === 'impulsion')!
    expect(tubo.forma === 'cilindro' && tubo.radio * 2).toBeCloseTo(0.2, 6)
    expect(s.yImpulsion).toBeGreaterThan(s.profundidad)
  })
})
