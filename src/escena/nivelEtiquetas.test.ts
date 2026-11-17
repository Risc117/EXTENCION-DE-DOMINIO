import { describe, expect, it } from 'vitest'
import { DISTANCIA_INICIAL } from '../nucleo/constantesCamara'
import { etiquetasDelNivel, largoEscalonado, largoFlecha, nivelEtiquetas, type ItemEtiqueta } from './nivelEtiquetas'

describe('nivel de las etiquetas según el zoom', () => {
  it('con la cámara en la vista general es "lejos"', () => {
    expect(nivelEtiquetas(DISTANCIA_INICIAL, null, 'lejos')).toBe('lejos')
  })
  it('al acercarse pasa a "medio" y luego a "cerca"', () => {
    expect(nivelEtiquetas(DISTANCIA_INICIAL * 0.6, null, 'lejos')).toBe('medio')
    expect(nivelEtiquetas(DISTANCIA_INICIAL * 0.2, null, 'medio')).toBe('cerca')
  })
  it('sale de "cerca" con margen: se queda hasta 0.385 de la distancia inicial y entra por debajo de 0.318', () => {
    expect(nivelEtiquetas(DISTANCIA_INICIAL * 0.37, null, 'cerca')).toBe('cerca')
    expect(nivelEtiquetas(DISTANCIA_INICIAL * 0.37, null, 'medio')).toBe('medio')
    expect(nivelEtiquetas(DISTANCIA_INICIAL * 0.3, null, 'medio')).toBe('cerca')
    expect(nivelEtiquetas(DISTANCIA_INICIAL * 0.4, null, 'cerca')).toBe('medio')
  })
  it('con una unidad enfocada es siempre "cerca"', () => {
    expect(nivelEtiquetas(DISTANCIA_INICIAL, 'rafa', 'lejos')).toBe('cerca')
  })
  it('tiene margen: en el borde se queda en el nivel que ya tenía', () => {
    const borde = DISTANCIA_INICIAL * 0.85
    expect(nivelEtiquetas(borde * 0.98, null, 'lejos')).toBe('lejos')
    expect(nivelEtiquetas(borde * 0.98, null, 'medio')).toBe('medio')
    expect(nivelEtiquetas(borde * 0.9, null, 'medio')).toBe('medio')
    expect(nivelEtiquetas(borde * 0.8, null, 'lejos')).toBe('medio')
  })
})

const items: ItemEtiqueta[] = [
  { id: 'rafa', texto: 'RAFA', tipo: 'unidad', punta: [10, 4, -5] },
  { id: 'bombeo', texto: 'Bombeo', tipo: 'unidad', punta: [0, 3, 0] },
  { id: 'garita', texto: 'Garita', tipo: 'edificio', punta: [-4, 3, 75] },
]

describe('qué etiquetas salen en cada nivel', () => {
  it('lejos: solo las unidades de tratamiento', () => {
    expect(etiquetasDelNivel(items, 'lejos', 100).map((e) => e.id)).toEqual(['rafa', 'bombeo'])
  })
  it('medio: unidades y edificios', () => {
    expect(etiquetasDelNivel(items, 'medio', 100).map((e) => e.id)).toEqual(['rafa', 'bombeo', 'garita'])
  })
  it('cerca: ninguna (cada unidad dibuja las suyas)', () => {
    expect(etiquetasDelNivel(items, 'cerca', 100)).toEqual([])
  })
  it('el texto va sobre la punta, a la altura que da el largo de la flecha', () => {
    const [e] = etiquetasDelNivel(items, 'lejos', 100)
    expect(e.punta).toEqual([10, 4, -5])
    expect(e.origen[0]).toBe(10)
    expect(e.origen[2]).toBe(-5)
    expect(e.origen[1]).toBeCloseTo(4 + largoFlecha(100), 9)
    expect(e.texto).toBe('RAFA')
  })
})

describe('etiquetas escalonadas', () => {
  const fila: ItemEtiqueta[] = Array.from({ length: 7 }, (_, n) => ({ id: `u${n}`, texto: `U${n}`, tipo: 'unidad', punta: [n, 0, 0] }))
  it('la primera queda a la altura del largo de la flecha y las vecinas, cada una más arriba', () => {
    const alturas = etiquetasDelNivel(fila, 'lejos', 100).map((e) => e.origen[1])
    expect(alturas[0]).toBeCloseTo(largoFlecha(100), 9)
    for (let n = 1; n < 5; n++) expect(alturas[n]).toBeGreaterThan(alturas[n - 1])
  })
  it('después del último escalón vuelve a empezar', () => {
    const alturas = etiquetasDelNivel(fila, 'lejos', 100).map((e) => e.origen[1])
    expect(alturas[5]).toBeCloseTo(alturas[0], 9)
    expect(largoEscalonado(10, 6)).toBeCloseTo(largoEscalonado(10, 1), 9)
  })
  it('ninguna vecina inmediata queda a la misma altura', () => {
    const alturas = etiquetasDelNivel(fila, 'lejos', 100).map((e) => e.origen[1])
    for (let n = 1; n < alturas.length; n++) expect(alturas[n]).not.toBeCloseTo(alturas[n - 1], 6)
  })
})

describe('largo de la flecha', () => {
  it('crece con la distancia de la cámara', () => {
    expect(largoFlecha(400)).toBeGreaterThan(largoFlecha(200))
  })
  it('tiene un mínimo y un máximo', () => {
    expect(largoFlecha(1)).toBe(largoFlecha(0))
    expect(largoFlecha(1e6)).toBe(largoFlecha(1e7))
    expect(largoFlecha(1e6)).toBeGreaterThan(largoFlecha(1))
  })
})
