import { describe, expect, it } from 'vitest'
import calidadCruda from '../../datos/calidad.json'
import crudo from '../../datos/linea.json'
import hidro from '../../datos/hidrograma.json'
import escala from '../../datos/escalaCaudal.json'
import lodosCrudo from '../../datos/lodosBiogas.json'
import type { ParametrosTanque } from '../estado/simulacion'
import { avanzarLinea } from './avanzarLinea'
import { caudalDrenaje, drenaje, esquemaDrenaje } from './drenaje'
import { crearHidrograma } from './hidrograma'
import { crearLinea } from './linea'
import { esquemaCalidad } from './calidadEsquema'
import { produccionLodosBiogas } from './lodosBiogas'
import { esquemaLodosBiogas } from './lodosBiogasEsquema'

const tanque: ParametrosTanque = { area: 45.13, alturaUtil: 4.9, alturaTotal: 5.4, alturaEjeSalida: 0.3, diametroSalida: 0.16 }
const h = crearHidrograma(hidro, escala)
const dia = h.dias[0]

describe('datos del drenaje de los lechos', () => {
  it('son Dato de ejemplo, por confirmar, y dicen cómo se calculó el caudal', () => {
    expect(drenaje.demo).toBe(true)
    expect(drenaje.fuente).toMatch(/por confirmar/i)
    expect(drenaje.fuente).toMatch(/impulsión/i)
    for (const m of [drenaje.bomba.alturaDinamica, drenaje.bomba.potencia, drenaje.diametroImpulsion, drenaje.diametroDrenaje]) {
      expect(m.demo).toBe(true)
      expect(m.fuente).toContain('No está en las fuentes')
    }
  })
  it('el esquema rechaza una potencia en cero y datos sin fuente', () => {
    const a = structuredClone(drenaje)
    a.bomba.potencia.valor = 0
    expect(esquemaDrenaje.safeParse(a).success).toBe(false)
    const b = structuredClone(drenaje)
    b.fuente = ''
    expect(esquemaDrenaje.safeParse(b).success).toBe(false)
  })
})

describe('caudal del drenaje: el agua que pierde el lodo en los lechos', () => {
  const lodos = esquemaLodosBiogas.parse(lodosCrudo)
  const dqo = esquemaCalidad.parse(calidadCruda).afluente.dqo.valor
  const p = produccionLodosBiogas(lodos, dqo, escala.caudalPromedio.valor)
  it('es el lodo húmedo menos el deshidratado (m³/d) pasado a L/s', () => {
    expect(caudalDrenaje()).toBeCloseTo(((p.lodoHumedoM3dia - p.lodoDeshidratadoM3dia) * 1000) / 86400, 9)
  })
  it('es positivo y mucho menor que el caudal de diseño (menos del 1 %)', () => {
    expect(caudalDrenaje()).toBeGreaterThan(0)
    expect(caudalDrenaje()).toBeLessThan(escala.caudalPromedio.valor * 0.01)
  })
})

describe('el drenaje suma al caudal que entra al cárcamo y a la línea', () => {
  const corrida = (retorno?: number) => {
    const linea = crearLinea(crudo, { tanque, modo: 'constante' })
    avanzarLinea(linea, h, dia, 6, 3 * 3600, retorno)
    return avanzarLinea(linea, h, dia, 9, 3 * 3600, retorno)
  }
  it('con retorno, el cárcamo recibe el caudal de entrada más el drenaje', () => {
    const [sin, con] = [corrida(), corrida(0.5)]
    expect(con.nodos.bombeo.entrada - sin.nodos.bombeo.entrada).toBeCloseTo(0.5, 9)
  })
  it('sin retorno todo queda como antes (el parámetro es opcional)', () => {
    expect(corrida(0).nodos.bombeo.entrada).toBeCloseTo(corrida().nodos.bombeo.entrada, 12)
  })
})
