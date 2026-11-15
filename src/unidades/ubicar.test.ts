import { describe, expect, it } from 'vitest'
import crudo from '../../datos/planta.json'
import { esquemaPlanta } from './planta/esquema'
import { cotaReferencia, giroEscena, posicionEscena, ubicar } from './ubicar'
import type { UnidadBase } from './tipos'

const planta = () => esquemaPlanta.parse(structuredClone(crudo))
const base = (id: string, demo = false): UnidadBase => ({ id, nombre: id, demo, tamano: 5, Componente: () => null })

describe('ubicar', () => {
  it('toma posición, giro y cota del JSON, en el orden del JSON', () => {
    const p = planta()
    const bases = p.unidades.map((u) => base(u.id))
    const r = ubicar(bases, p)
    expect(r.map((u) => u.id)).toEqual(p.unidades.map((u) => u.id))
    expect(r[0].posicion).toEqual({ x: p.unidades[0].x.valor, y: p.unidades[0].y.valor })
    expect(r[0].cotaFondo).toBe(p.unidades[0].cotaFondo.valor)
  })

  it('cambiar la posición en el JSON mueve la unidad sin tocar código', () => {
    const p = planta()
    p.unidades[1].x.valor = 123.4
    const r = ubicar(p.unidades.map((u) => base(u.id)), p)
    expect(posicionEscena(r[1], 0)[0]).toBe(123.4)
  })

  it('falla si una unidad no tiene lugar en la planta', () => {
    const p = planta()
    expect(() => ubicar([...p.unidades.map((u) => base(u.id)), base('fantasma')], p)).toThrow(/fantasma/)
  })

  it('falla si la planta nombra una unidad que no existe', () => {
    const p = planta()
    expect(() => ubicar(p.unidades.slice(1).map((u) => base(u.id)), p)).toThrow(/no existe/)
  })

  it('marca demo si los datos de ubicación son de ejemplo', () => {
    const p = planta()
    expect(ubicar(p.unidades.map((u) => base(u.id)), p).every((u) => u.demo)).toBe(true)
  })
})

describe('coordenadas de la escena', () => {
  const u = { posicion: { x: 10, y: 4 }, cotaFondo: 2990, giro: 90 }
  it('el norte (y) va hacia -z y la cota se mide desde la referencia', () => {
    expect(posicionEscena(u, 2988)).toEqual([10, 2, -4])
  })
  it('la referencia es la cota más baja', () => {
    expect(cotaReferencia([{ cotaFondo: 5 }, { cotaFondo: 3 }])).toBe(3)
  })
  it('el giro pasa de grados a radianes', () => {
    expect(giroEscena(u)).toBeCloseTo(Math.PI / 2)
  })
})
