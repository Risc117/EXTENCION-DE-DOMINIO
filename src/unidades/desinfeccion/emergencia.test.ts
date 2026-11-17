import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/desinfeccion.json'
import { seguridad } from '../comun/datosSeguridad'
import { esquemaDesinfeccion } from './esquema'
import { construirPiezasCaseta } from './geometriaCaseta'
import { construirEmergencia } from './emergencia'

const datos = esquemaDesinfeccion.parse(crudo)
const e = seguridad.emergencia
const piezas = construirEmergencia(datos, e)
const L = datos.caseta.largo.valor / 2
/** Mitad (m) del cerco de 6 × 6 m que rodea la caseta (DXF, capa PTAR-EDIFICACIONES; ver datos/desinfeccion.json). */
const MITAD_CERCO_CASETA = 3
const cilindro = (id: string) => {
  const p = piezas.find((x) => x.id === id)
  if (!p || p.forma !== 'cilindro') throw new Error(`No hay un cilindro ${id}`)
  return p
}

describe('ducha de emergencia y lavaojos junto a la caseta de cloración', () => {
  it('sus medidas son Dato de ejemplo (el plano solo los nombra)', () => {
    for (const m of Object.values(e)) {
      expect(m.demo).toBe(true)
      expect(m.fuente).toContain('No está en las fuentes')
    }
  })
  it('están afuera del muro este de la caseta, a la separación pedida del muro, y dentro del cerco de 6 × 6 m', () => {
    for (const id of ['ducha-poste', 'lavaojos-pedestal']) {
      const p = cilindro(id)
      expect(p.pos[0]).toBeCloseTo(L + e.separacionMuro.valor, 9)
      expect(p.pos[0] - p.radio).toBeGreaterThan(L)
    }
    for (const id of ['ducha-plato', 'lavaojos-base', 'lavaojos-taza']) {
      const p = cilindro(id)
      expect(p.pos[0] - p.radio).toBeGreaterThan(L)
      expect(p.pos[0] + p.radio).toBeLessThanOrEqual(MITAD_CERCO_CASETA)
    }
  })
  it('la ducha y el lavaojos están a la separación pedida entre sí (a lo largo del muro)', () => {
    expect(Math.abs(cilindro('lavaojos-pedestal').pos[2] - cilindro('ducha-poste').pos[2])).toBeCloseTo(e.separacionEntre.valor, 9)
  })
  it('el cabezal de la ducha y la taza del lavaojos están a sus alturas', () => {
    expect(cilindro('ducha-cabezal').pos[1]).toBeCloseTo(e.alturaDucha.valor, 9)
    expect(cilindro('lavaojos-taza').pos[1]).toBeCloseTo(e.alturaLavaojos.valor, 9)
  })
  it('apoyan en el piso (y = 0) y no tapan la línea de cloro ni nada de la caseta', () => {
    for (const id of ['ducha-plato', 'lavaojos-base']) expect(cilindro(id).pos[1] - cilindro(id).alto / 2).toBeCloseTo(0, 9)
    const ids = [...piezas, ...construirPiezasCaseta(datos)].map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
