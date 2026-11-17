import { describe, expect, it } from 'vitest'
import crudo from '../../datos/linea.json'
import hidro from '../../datos/hidrograma.json'
import escala from '../../datos/escalaCaudal.json'
import type { ModoSalida, ParametrosTanque } from '../estado/simulacion'
import { avanzarLinea } from './avanzarLinea'
import { crearHidrograma } from './hidrograma'
import { crearLinea } from './linea'

const tanque: ParametrosTanque = { area: 45.13, alturaUtil: 4.9, alturaTotal: 5.4, alturaEjeSalida: 0.3, diametroSalida: 0.16 }
const h = crearHidrograma(hidro, escala)
const dia = h.dias[0]

describe('avanzarLinea', () => {
  it('lleva el caudal por toda la línea: las ramas de los sedimentadores suman el caudal de la cámara de reparto', () => {
    const linea = crearLinea(crudo, { tanque, modo: 'constante' })
    avanzarLinea(linea, h, dia, 6, 3 * 3600)
    const r = avanzarLinea(linea, h, dia, 9, 3 * 3600)
    expect(r.nodos.bombeo.entrada).toBeGreaterThan(0)
    expect(r.nodos.rejas.entrada).toBeGreaterThan(0)
    const reparto = r.nodos['camara-reparto']
    expect(r.nodos['sedimentador-1'].entrada + r.nodos['sedimentador-2'].entrada).toBeCloseTo(reparto.salida, 9)
    expect(r.nodos['sedimentador-1'].entrada).toBeCloseTo(r.nodos['sedimentador-2'].entrada, 9)
  })

  it('el modo y el ajuste pueden ser funciones y siguen los cambios', () => {
    let modo: ModoSalida = 'constante'
    let ajuste: number | null = null
    const linea = crearLinea(crudo, { tanque, modo: () => modo, ajuste: () => ajuste })
    avanzarLinea(linea, h, dia, 6, 2 * 3600)
    const base = avanzarLinea(linea, h, dia, 8, 600).nodos.homogeneizador.salida
    ajuste = base + 2
    const mas = avanzarLinea(linea, h, dia, 8.2, 600).nodos.homogeneizador.salida
    expect(mas).toBeGreaterThan(base)
    modo = 'gravedad'
    expect(() => avanzarLinea(linea, h, dia, 8.4, 600)).not.toThrow()
  })

  it('reiniciar vuelve el nivel del homogeneizador a 0', () => {
    const linea = crearLinea(crudo, { tanque, modo: 'constante' })
    expect(avanzarLinea(linea, h, dia, 6, 4 * 3600).nivel).toBeGreaterThan(0)
    linea.reiniciar()
    expect(linea.paso(0, 1, h.promedio(dia)).nivel).toBe(0)
  })

  it('da la vuelta a las 24 h al avanzar', () => {
    const linea = crearLinea(crudo, { tanque, modo: 'constante' })
    expect(() => avanzarLinea(linea, h, dia, 23.5, 3 * 3600)).not.toThrow()
  })
})
