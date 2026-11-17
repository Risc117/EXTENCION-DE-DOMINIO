import { describe, expect, it } from 'vitest'
import crudo from '../../datos/demo.json'
import type { ParametrosTanque } from '../estado/simulacion'
import { crearGuion, esquemaGuion, textoConValores, valoresDemo } from './guion'
import { hidrograma } from './hidrogramaCargado'
import { valoresPlanta } from './valoresRecorrido'

const tanque: ParametrosTanque = { area: Math.PI * 3.79 ** 2, alturaUtil: 4.9, alturaTotal: 5.4, alturaEjeSalida: 0.3, diametroSalida: 0.16 }
type Registro = { fuente?: string; pasos: Record<string, unknown>[] }
const copia = () => structuredClone(crudo) as unknown as Registro

describe('datos/demo.json', () => {
  it('cumple el esquema y trae los 15 pasos del guion (4 de entrada, 5 del tanque y 6 de salida)', () => {
    const pasos = crearGuion(crudo)
    expect(pasos).toHaveLength(15)
    for (const p of pasos) expect(p.duracionSegundos).toBeGreaterThan(0)
  })

  it('los días, velocidades y modos de las acciones existen en la simulación', () => {
    for (const p of crearGuion(crudo)) {
      if (p.accion.dia !== undefined) expect(hidrograma.dias).toContain(p.accion.dia)
    }
  })

  it('todos los marcadores de los textos se pueden llenar con los datos', () => {
    const valores = { ...valoresPlanta(), ...valoresDemo(tanque, hidrograma, 1) }
    for (const p of crearGuion(crudo)) {
      expect(textoConValores(p.texto, valores)).not.toMatch(/[{}]/)
      expect(textoConValores(p.titulo, valores)).not.toMatch(/[{}]/)
    }
  })

  it('rechaza datos sin fuente, sin pasos, con duración 0 o con un modo que no existe', () => {
    const sinFuente = copia()
    delete sinFuente.fuente
    expect(esquemaGuion.safeParse(sinFuente).success).toBe(false)
    const sinPasos = copia()
    sinPasos.pasos = []
    expect(esquemaGuion.safeParse(sinPasos).success).toBe(false)
    const sinDuracion = copia()
    sinDuracion.pasos[0].duracionSegundos = 0
    expect(esquemaGuion.safeParse(sinDuracion).success).toBe(false)
    const modoMalo = copia()
    modoMalo.pasos[2].accion = { modoSalida: 'magico' }
    expect(esquemaGuion.safeParse(modoMalo).success).toBe(false)
  })
})

describe('valoresDemo', () => {
  it('saca diámetro, altura y volúmenes de los datos del tanque y del hidrograma', () => {
    const v = valoresDemo(tanque, hidrograma, 1)
    expect(v.diametroInterior).toBeCloseTo(7.58, 6)
    expect(v.alturaUtil).toBe(4.9)
    expect(v.volumenUtil).toBeCloseTo(221.1, 1)
    expect(v.volumenRequerido).toBeCloseTo(113.5, 0)
    expect(v.dia).toBe(1)
  })
})

describe('textoConValores', () => {
  it('reemplaza marcadores con los decimales pedidos', () => {
    expect(textoConValores('D = {d:2} m, V = {v:0} m³', { d: 7.5801, v: 221.1 })).toBe('D = 7.58 m, V = 221 m³')
  })

  it('sin decimales pedidos quita ceros sobrantes', () => {
    expect(textoConValores('{a} y {b}', { a: 4.9, b: 3 })).toBe('4.9 y 3')
  })

  it('un marcador desconocido da error claro', () => {
    expect(() => textoConValores('{nada}', {})).toThrow(/nada/)
  })
})
