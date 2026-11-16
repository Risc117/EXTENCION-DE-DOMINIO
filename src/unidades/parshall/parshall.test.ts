import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/parshall.json'
import { disponer } from './disposicion'
import { esquemaParshall } from './esquema'
import { construirAguas, construirPiezas } from './geometria'
import { cargaHo, profundidadGarganta } from './hidraulica'

const datos = esquemaParshall.parse(crudo)

describe('canaleta Parshall', () => {
  it('Ho a Qmh coincide con la hoja (G8 = 0.2248 m, o sea ≈ 0.225)', () => {
    expect(cargaHo(datos, 13.072)).toBeCloseTo(0.2248, 3)
  })

  it('Ho crece con el caudal y es cero sin caudal', () => {
    expect(cargaHo(datos, 0)).toBe(0)
    expect(cargaHo(datos, 6.536)).toBeLessThan(cargaHo(datos, 13.072))
    expect(profundidadGarganta(datos, 6.536)).toBeLessThan(profundidadGarganta(datos, 13.072))
  })

  it('el agua de entrada sube Ho sobre el piso de entrada (N) y no pasa de la canaleta', () => {
    const entrada = construirAguas(datos, 13.072).find((a) => a.id === 'agua-entrada')!
    expect(entrada.y0).toBeCloseTo(0.114, 6)
    expect(entrada.nivel).toBeCloseTo(0.2248, 3)
    for (const a of construirAguas(datos, 500)) expect(a.nivel).toBeLessThanOrEqual(0.762)
  })

  it('el largo del tramo convergente sale de la pared de la hoja (A = 0.879 m) por Pitágoras', () => {
    const s = disponer(datos)
    const eje = s.xGarganta - s.xConvergente
    expect(Math.hypot(eje, (0.575 - 0.2286) / 2)).toBeCloseTo(0.879, 6)
  })

  it('los muros se angostan hasta la garganta y se ensanchan a la salida', () => {
    const piezas = construirPiezas(datos)
    const z = (id: string) => Math.abs(piezas.find((p) => p.id === id)!.pos[2])
    expect(z('muro-garganta-a')).toBeLessThan(z('muro-entrada-a'))
    expect(z('muro-salida-a')).toBeGreaterThan(z('muro-garganta-a'))
  })

  it('cambiar el ancho de la garganta en el JSON cambia la pieza y la profundidad', () => {
    const otro = structuredClone(crudo)
    otro.garganta.ancho.valor = 0.3
    const d = esquemaParshall.parse(otro)
    expect(disponer(d).anchoGarganta).toBeCloseTo(0.3, 6)
    expect(profundidadGarganta(d, 13.072)).toBeLessThan(profundidadGarganta(datos, 13.072))
  })

  it('rechaza una entrada más angosta que la garganta', () => {
    const mala = structuredClone(crudo)
    mala.convergente.anchoEntrada.valor = 0.1
    expect(esquemaParshall.safeParse(mala).success).toBe(false)
  })
})
