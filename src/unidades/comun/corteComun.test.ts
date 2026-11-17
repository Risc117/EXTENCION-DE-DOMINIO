import { describe, expect, it } from 'vitest'
import { planoCorte, planoCorteLocal, planoCorteMundo } from './corte'
import { planta } from '../planta'
import { unidades } from '../registro'
import { giroEscena, posicionEscena } from '../ubicar'
import { planoAMundo } from '../ubicacion'

const referencia = Math.min(...unidades.map((u) => u.cotaFondo))
const ubicacion = (u: (typeof unidades)[number]) => ({ posicion: posicionEscena(u, referencia), giro: giroEscena(u) })
const rafa = unidades.find((u) => u.id === 'rafa')!

describe('T16.4.3 · un solo criterio de corte para todas las unidades', () => {
  it('todas las unidades quitan la misma mitad del mundo: la normal del plano es la misma y es la del RAFA', () => {
    const base = planoAMundo(planoCorte(true, 0, 5)!, ubicacion(rafa)).normal
    expect(unidades.length).toBeGreaterThan(10)
    for (const u of unidades) {
      const n = planoCorteMundo(true, 0, 5, ubicacion(u))!.normal
      for (let i = 0; i < 3; i++) expect(n[i], `${u.id} eje ${i}`).toBeCloseTo(base[i], 9)
    }
  })

  it('el plano pasa por el centro de cada unidad con el deslizador en 0 y se corre posicion × radio con él', () => {
    for (const u of unidades) {
      const ub = ubicacion(u)
      const [px, py, pz] = ub.posicion
      const centro = planoCorteMundo(true, 0, 4, ub)!
      expect(centro.normal[0] * px + centro.normal[1] * py + centro.normal[2] * pz + centro.constante, u.id).toBeCloseTo(0, 9)
      expect(planoCorteMundo(true, 0.5, 4, ub)!.constante - centro.constante, u.id).toBeCloseTo(2, 9)
    }
  })

  it('un punto de la mitad quitada queda fuera (distancia negativa) y uno de la otra mitad se queda, igual para todas', () => {
    // Un punto a 3 m al este del centro de cada unidad se quita; a 3 m al oeste se queda.
    for (const u of unidades) {
      const ub = ubicacion(u)
      const p = planoCorteMundo(true, 0, 4, ub)!
      const dist = (dx: number) => p.normal[0] * (ub.posicion[0] + dx) + p.normal[1] * ub.posicion[1] + p.normal[2] * ub.posicion[2] + p.constante
      expect(dist(3), `${u.id} este`).toBeLessThan(0)
      expect(dist(-3), `${u.id} oeste`).toBeGreaterThan(0)
    }
  })

  it('sin "Ver corte" no hay plano, y el giro común es el del RAFA de planta.json', () => {
    expect(planoCorteMundo(false, 0, 4, ubicacion(rafa))).toBeNull()
    expect(planoCorteLocal(false, 0, 4, ubicacion(rafa))).toBeNull()
    expect(planta.unidades.find((x) => x.id === 'rafa')!.giro.valor).toBeCloseTo(81.77, 2)
  })

  it('el plano en el eje de la unidad (para las etiquetas) es el mismo plano del mundo', () => {
    for (const u of unidades) {
      const ub = ubicacion(u)
      const mundo = planoCorteMundo(true, 0.3, 4, ub)!
      const local = planoCorteLocal(true, 0.3, 4, ub)!
      // Un punto cualquiera del eje de la unidad, pasado al mundo, da la misma distancia con los dos planos.
      const [lx, ly, lz] = [1.2, 0.7, -0.9]
      const c = Math.cos(ub.giro)
      const s = Math.sin(ub.giro)
      const mundoP = [lx * c + lz * s + ub.posicion[0], ly + ub.posicion[1], -lx * s + lz * c + ub.posicion[2]]
      const dMundo = mundo.normal[0] * mundoP[0] + mundo.normal[1] * mundoP[1] + mundo.normal[2] * mundoP[2] + mundo.constante
      const dLocal = local.normal[0] * lx + local.normal[1] * ly + local.normal[2] * lz + local.constante
      expect(dLocal, u.id).toBeCloseTo(dMundo, 9)
    }
  })
})
