import { describe, expect, it } from 'vitest'
import crudo from '../../datos/hidrograma.json'
import { crearHidrograma, esquemaHidrograma } from './hidrograma'

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
