import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/homogeneizador.json'
import { esquemaHomogeneizador } from './esquema'
import { construirPiezas, type Pieza } from './geometria'

const datos = esquemaHomogeneizador.parse(crudo)
const porTipo = (tipo: string, d = datos) => construirPiezas(d).filter((p) => p.tipo === tipo)
const unica = (tipo: string, d = datos): Pieza => porTipo(tipo, d)[0]

describe('construirPiezas (tanque circular)', () => {
  it('arma solado, losa de fondo, muro, losa de techo, ingreso, salida, rebose, agitador y zona de mezcla', () => {
    for (const tipo of ['solado', 'losa-fondo', 'muro', 'losa-techo', 'ingreso', 'salida', 'agitador', 'zona-mezcla']) {
      expect(porTipo(tipo).length, tipo).toBeGreaterThan(0)
    }
    expect(porTipo('rebose').length).toBe(2)
  })

  it('el muro es un anillo con el diámetro interior y exterior del JSON', () => {
    const muro = unica('muro')
    expect(muro.forma).toBe('anillo')
    if (muro.forma !== 'anillo') return
    expect(muro.radioInterior).toBeCloseTo(3.79, 6)
    expect(muro.radioExterior).toBeCloseTo(3.99, 6)
    expect(muro.alto).toBeCloseTo(5.4, 6)
  })

  it('cambiar el diámetro en el JSON cambia el tanque', () => {
    const otro = structuredClone(datos)
    otro.tanque.diametroInterior.valor = 12
    otro.tanque.diametroExterior.valor = 12.4
    const muro = unica('muro', otro)
    expect(muro.forma === 'anillo' && muro.radioInterior).toBeCloseTo(6, 6)
  })

  it('el ingreso está arriba, sobre el nivel de agua, y la salida abajo; el ingreso sale al sur y la salida al norte, como en el mapa general', () => {
    const ingreso = unica('ingreso')
    const salida = unica('salida')
    expect(ingreso.posicion[1]).toBeGreaterThan(datos.tanque.alturaUtil.valor)
    expect(salida.posicion[1]).toBeLessThan(2)
    expect(ingreso.posicion[2]).toBeGreaterThan(0)
    expect(salida.posicion[2]).toBeLessThan(0)
  })

  it('el rebose queda del lado de la entrada', () => {
    for (const r of porTipo('rebose')) expect(r.posicion[0]).toBeLessThan(0)
  })

  it('el agitador está al centro y la zona de mezcla lo rodea', () => {
    const a = unica('agitador')
    expect(a.posicion[0]).toBe(0)
    expect(a.posicion[2]).toBe(0)
    const z = unica('zona-mezcla')
    expect(z.forma === 'cilindro' && z.radio).toBeCloseTo(1.5, 6)
  })

  it('la losa de techo queda sobre el muro y la de fondo bajo el agua', () => {
    expect(unica('losa-techo').posicion[1]).toBeGreaterThan(datos.tanque.alturaTotal.valor)
    expect(unica('losa-fondo').posicion[1]).toBeLessThan(0)
    expect(unica('solado').posicion[1]).toBeLessThan(unica('losa-fondo').posicion[1])
  })
})
