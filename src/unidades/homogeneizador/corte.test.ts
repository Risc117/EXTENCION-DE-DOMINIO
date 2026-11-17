import { describe, expect, it } from 'vitest'
import { planoCorte, planoCorteMundo } from '../comun/corte'
import { planoAMundo } from '../ubicacion'
import { giroEscena, posicionEscena } from '../ubicar'
import { planta } from '../planta'
import { giroCorteHomogeneizador } from './corte'

const de = (id: string) => planta.unidades.find((u) => u.id === id)!
const ubicacion = (id: string) => ({ posicion: posicionEscena({ posicion: { x: de(id).x.valor, y: de(id).y.valor }, cotaFondo: de(id).cotaFondo.valor }, 2970), giro: giroEscena({ giro: de(id).giro.valor }) })

describe('T16.4.2 · corte del homogeneizador', () => {
  it('quita la misma mitad que el RAFA: el plano del homogeneizador tiene la misma normal en el mundo (misma cara cortada)', () => {
    const rafa = planoAMundo(planoCorte(true, 0, 8)!, ubicacion('rafa'))
    const homog = planoCorteMundo(true, 0, 3.79, ubicacion('homogeneizador'), giroCorteHomogeneizador)!
    for (let i = 0; i < 3; i++) expect(homog.normal[i]).toBeCloseTo(rafa.normal[i], 9)
  })

  it('pasa por el centro del tanque con el deslizador en 0 y se mueve con él como en las demás unidades', () => {
    const u = ubicacion('homogeneizador')
    const centro = planoCorteMundo(true, 0, 3.79, u, giroCorteHomogeneizador)!
    const [px, py, pz] = u.posicion
    expect(centro.normal[0] * px + centro.normal[1] * py + centro.normal[2] * pz + centro.constante).toBeCloseTo(0, 9)
    const lado = planoCorteMundo(true, 0.5, 3.79, u, giroCorteHomogeneizador)!
    expect(lado.constante - centro.constante).toBeCloseTo(0.5 * 3.79, 9)
  })

  it('sin "Ver corte" no hay plano y, sin giro de referencia, el plano es el de siempre de cada unidad (no cambia a las demás)', () => {
    const u = ubicacion('sedimentador-1')
    expect(planoCorteMundo(false, 0, 3, u)).toBeNull()
    const normal = planoAMundo(planoCorte(true, 0, 3)!, u).normal
    const igual = planoCorteMundo(true, 0, 3, u)!.normal
    for (let i = 0; i < 3; i++) expect(igual[i]).toBeCloseTo(normal[i], 9)
  })

  it('el giro de referencia sale de planta.json: es el del RAFA', () => {
    expect((giroCorteHomogeneizador * 180) / Math.PI).toBeCloseTo(de('rafa').giro.valor, 6)
  })
})
