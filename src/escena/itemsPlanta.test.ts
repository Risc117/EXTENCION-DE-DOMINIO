import { describe, expect, it } from 'vitest'
import { unidades } from '../unidades/registro'
import { cotaReferencia } from '../unidades/ubicar'
import { itemsDePlanta } from './itemsPlanta'
import { etiquetasDelNivel } from './nivelEtiquetas'

const referencia = cotaReferencia(unidades)
const items = itemsDePlanta(referencia)

describe('etiquetas de toda la planta con los datos reales', () => {
  it('lejos salen las 13 unidades; medio suma los 6 edificios; cerca ninguna', () => {
    expect(etiquetasDelNivel(items, 'lejos', 300)).toHaveLength(13)
    expect(etiquetasDelNivel(items, 'medio', 300)).toHaveLength(19)
    expect(etiquetasDelNivel(items, 'cerca', 300)).toHaveLength(0)
  })
  it('cada flecha apunta a la coronación de su unidad (sobre el fondo) y al techo de su edificio', () => {
    const rafa = items.find((i) => i.id === 'rafa')!
    const u = unidades.find((x) => x.id === 'rafa')!
    expect(rafa.punta[0]).toBe(u.posicion.x)
    expect(rafa.punta[2]).toBe(-u.posicion.y)
    expect(rafa.punta[1]).toBeGreaterThan(u.cotaFondo - referencia)
    const garita = items.find((i) => i.id === 'garita')!
    expect(garita.punta[1]).toBeCloseTo(2985.65 - referencia + 2.8, 6)
  })
})
