import { describe, expect, it } from 'vitest'
import { MARGEN_VENTANA_TERRENO } from '../../nucleo/terreno'
import { entorno } from '../../unidades/entorno/datos'
import { planta } from '../../unidades/planta'
import { segmentosCurvas } from './geometriaCurvas'
import { ventanaVisible } from './ventana'

describe('ventana visible del terreno', () => {
  const v = ventanaVisible()
  const dentro = (x: number, y: number, margen = 0) => x >= v.xMin + margen && x <= v.xMax - margen && y >= v.yMin + margen && y <= v.yMax - margen
  it('contiene el inicio y el fin del río con su margen', () => {
    for (const l of [...entorno.rio.margenesA, entorno.rio.margenB]) for (const p of l) expect(dentro(p.x, p.y, MARGEN_VENTANA_TERRENO - 0.001), `${p.x},${p.y}`).toBe(true)
  })
  it('contiene todas las unidades y todo el cerco de la planta', () => {
    for (const u of planta.unidades) expect(dentro(u.x.valor, u.y.valor), u.id).toBe(true)
    for (const t of entorno.cerco.trazos) for (const p of t) expect(dentro(p.x, p.y), `${p.x},${p.y}`).toBe(true)
  })
})

describe('curvas de nivel recortadas', () => {
  it('un tramo que sale de la ventana se corta en el borde', () => {
    const curva = { cota: 100, tipo: 'mayor' as const, puntos: [[5, 5], [15, 5]] as [number, number][] }
    const r = segmentosCurvas([curva], ['mayor'], 0, 0, () => false, { xMin: 0, xMax: 10, yMin: 0, yMax: 10 })
    expect(Array.from(r)).toEqual([5, 100, -5, 10, 100, -5])
    expect(segmentosCurvas([curva], ['mayor'], 0, 0, () => false, { xMin: 20, xMax: 30, yMin: 0, yMax: 10 })).toHaveLength(0)
  })
})
