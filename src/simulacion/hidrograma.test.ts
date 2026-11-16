import { describe, expect, it } from 'vitest'
import crudo from '../../datos/hidrograma.json'
import escala from '../../datos/escalaCaudal.json'
import { crearHidrograma, esquemaEscala, esquemaHidrograma } from './hidrograma'

type Registro = { dias: { caudal_ls_por_hora: number[] }[]; fuente?: string }
const copia = () => structuredClone(crudo) as unknown as Registro

describe('datos/hidrograma.json', () => {
  it('cumple el esquema y trae 5 días de 24 horas', () => {
    const h = crearHidrograma(crudo)
    expect(h.dias).toEqual([1, 2, 3, 4, 5])
    expect(h.caudalEntrada(1, 0)).toBeCloseTo(6.872, 6)
  })

  it('el caudal se mantiene constante dentro de cada hora y la hora 24 vuelve a la 0', () => {
    const h = crearHidrograma(crudo)
    expect(h.caudalEntrada(1, 12.0)).toBeCloseTo(21.072, 6)
    expect(h.caudalEntrada(1, 12.99)).toBeCloseTo(21.072, 6)
    expect(h.caudalEntrada(1, 13.0)).toBeCloseTo(20.872, 6)
    expect(h.caudalEntrada(1, 24)).toBeCloseTo(h.caudalEntrada(1, 0), 6)
  })

  it('el promedio del día sale de los datos (≈ 13 L/s)', () => {
    const h = crearHidrograma(crudo)
    expect(h.promedio(1)).toBeCloseTo(13.005, 2)
    expect(h.promedio(4)).toBeCloseTo(13.0, 2)
  })

  it('un día que no existe da error claro', () => {
    expect(() => crearHidrograma(crudo).caudalEntrada(9, 0)).toThrow()
  })

  it('rechaza datos sin fuente, con horas faltantes o caudales negativos', () => {
    const sinFuente = copia()
    delete sinFuente.fuente
    expect(esquemaHidrograma.safeParse(sinFuente).success).toBe(false)
    const corto = copia()
    corto.dias[0].caudal_ls_por_hora.pop()
    expect(esquemaHidrograma.safeParse(corto).success).toBe(false)
    const negativo = copia()
    negativo.dias[0].caudal_ls_por_hora[3] = -1
    expect(esquemaHidrograma.safeParse(negativo).success).toBe(false)
  })
})

describe('hidrograma escalado a un solo caudal (T9.5)', () => {
  const h = crearHidrograma(crudo, escala)
  const QP = escala.caudalPromedio.valor
  const QMH = escala.caudalMaximoHorario.valor

  it('el promedio de cada día escalado es Qp ±0.01 L/s', () => {
    for (const d of h.dias) expect(Math.abs(h.promedio(d) - QP)).toBeLessThan(0.01)
  })

  it('el máximo escalado no supera Qmh', () => {
    for (const d of h.dias) {
      for (let hora = 0; hora < 24; hora++) expect(h.caudalEntrada(d, hora)).toBeLessThanOrEqual(QMH)
    }
  })

  it('el factor de cada día sale de los datos: Qp / promedio de ese día', () => {
    const base = crearHidrograma(crudo)
    expect(h.factorEscala(1)).toBeCloseTo(QP / base.promedio(1), 10)
    expect(h.factorEscala(1)).toBeCloseTo(0.5026, 3)
    const otro = crearHidrograma(crudo, { ...escala, caudalPromedio: { ...escala.caudalPromedio, valor: 3 } })
    expect(otro.factorEscala(1)).toBeCloseTo(3 / base.promedio(1), 10)
  })

  it('conserva la forma: la proporción entre horas no cambia', () => {
    const base = crearHidrograma(crudo)
    expect(h.caudalEntrada(1, 12) / h.caudalEntrada(1, 0)).toBeCloseTo(base.caudalEntrada(1, 12) / base.caudalEntrada(1, 0), 10)
  })

  it('sin escala el factor es 1 y expone el caudal de diseño', () => {
    expect(crearHidrograma(crudo).factorEscala(1)).toBe(1)
    expect(h.caudalDiseno).toBe(QP)
  })

  it('rechaza una escala sin fuente', () => {
    expect(esquemaEscala.safeParse({ ...escala, caudalPromedio: { valor: 6, unidad: 'L/s', demo: false } }).success).toBe(false)
  })
})
