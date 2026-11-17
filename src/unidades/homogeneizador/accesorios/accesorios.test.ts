import { describe, expect, it } from 'vitest'
import crudo from '../../../../datos/homogeneizador.json'
import { planta } from '../../planta'
import { esquemaHomogeneizador, type DatosHomogeneizador } from '../esquema'
import { construirAccesorios } from './index'
import type { PiezaAccesorio, TipoAccesorio } from './tipos'

const datos = esquemaHomogeneizador.parse(crudo)
const TECHO = 5.4 + 0.15
const de = (tipo: TipoAccesorio, d: DatosHomogeneizador = datos): PiezaAccesorio[] => construirAccesorios(d).filter((p) => p.tipo === tipo)
const modificado = (cambio: (d: DatosHomogeneizador) => void) => {
  const d = structuredClone(datos)
  cambio(d)
  return d
}
const cilindro = (p: PiezaAccesorio) => {
  if (p.forma !== 'cilindro') throw new Error(`${p.id} debe ser un cilindro`)
  return p
}
const caja = (p: PiezaAccesorio) => {
  if (p.forma !== 'caja') throw new Error(`${p.id} debe ser una caja`)
  return p
}

describe('construirAccesorios', () => {
  it('arma todos los accesorios del plano', () => {
    const tipos: TipoAccesorio[] = ['baranda', 'riel-baranda', 'portillo', 'brocal', 'tapa', 'escalera-riel', 'peldano', 'jaula', 'ventilacion', 'hongo', 'caja-valvula', 'varilla', 'valvula', 'relleno', 'terreno']
    for (const tipo of tipos) expect(de(tipo).length, tipo).toBeGreaterThan(0)
  })

  it('todas las piezas tienen un id distinto', () => {
    const ids = construirAccesorios(datos).map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('la baranda mide 1.05 m y tiene un poste por cada uno del JSON', () => {
    const postes = de('baranda')
    expect(postes).toHaveLength(24)
    expect(cilindro(postes[0]).largo).toBeCloseTo(1.05)
    expect(postes[0].posicion[1]).toBeCloseTo(TECHO + 1.05 / 2)
  })

  it('la baranda deja libre el hueco del portillo, que mide 1.00 m', () => {
    const portillo = de('portillo')[0]
    expect(caja(portillo).tamano[2]).toBe(1)
    const cercanos = de('baranda').filter((p) => Math.hypot(p.posicion[0] - portillo.posicion[0], p.posicion[2] - portillo.posicion[2]) < 0.5)
    expect(cercanos).toHaveLength(0)
  })

  it('cambiar la altura de la baranda en el JSON cambia las piezas', () => {
    const d = modificado((x) => { x.accesorios.baranda.altura.valor = 1.5 })
    expect(cilindro(de('baranda', d)[0]).largo).toBeCloseTo(1.5)
  })

  it('cambiar la cantidad de postes cambia cuántos hay', () => {
    const d = modificado((x) => { x.accesorios.baranda.numeroPostes.valor = 10 })
    expect(de('baranda', d)).toHaveLength(10)
  })

  it('la boca de acceso de 1.00 x 1.00 m queda sobre la losa, del lado de la salida', () => {
    const brocal = caja(de('brocal')[0])
    expect(brocal.tamano[0]).toBe(1)
    expect(brocal.tamano[2]).toBe(1)
    expect(brocal.posicion[0]).toBeCloseTo(3.15)
    expect(brocal.posicion[1]).toBeCloseTo(TECHO + 0.1)
    expect(de('tapa')[0].posicion[1]).toBeGreaterThan(brocal.posicion[1])
  })

  it('cambiar el lado de la boca cambia el brocal', () => {
    const d = modificado((x) => { x.accesorios.bocaAcceso.lado.valor = 0.8 })
    expect(caja(de('brocal', d)[0]).tamano[0]).toBe(0.8)
  })

  it('la escalera baja desde la boca hasta el fondo, pegada al muro', () => {
    const rieles = de('escalera-riel')
    expect(rieles).toHaveLength(2)
    const riel = cilindro(rieles[0])
    expect(riel.posicion[0]).toBeCloseTo(3.79 - 0.2)
    expect(riel.posicion[1] - riel.largo / 2).toBeCloseTo(0)
    expect(riel.posicion[1] + riel.largo / 2).toBeGreaterThan(TECHO)
    const alturas = de('peldano').map((p) => p.posicion[1])
    expect(Math.min(...alturas)).toBeGreaterThan(0)
    expect(Math.max(...alturas)).toBeLessThanOrEqual(riel.largo)
  })

  it('la jaula arranca a la altura del JSON y cambia con ella', () => {
    expect(Math.min(...de('jaula').map((p) => p.posicion[1]))).toBeCloseTo(2.2, 1)
    const d = modificado((x) => { x.accesorios.escalera.alturaInicioJaula.valor = 3 })
    expect(Math.min(...de('jaula', d).map((p) => p.posicion[1]))).toBeCloseTo(3, 1)
  })

  it('la ventilación Ø 2" lleva un hongo más ancho arriba del tubo', () => {
    const tubo = cilindro(de('ventilacion')[0])
    const hongo = de('hongo')[0]
    expect(tubo.radio).toBeCloseTo(0.0254)
    expect(hongo.forma === 'cono' && hongo.radio).toBeGreaterThan(0.0254)
    expect(hongo.posicion[1]).toBeGreaterThan(tubo.posicion[1])
  })

  it('la caja de válvula de la salida (tubo enterrado) queda sobre el suelo real; la entrada va por el aire y solo trae su válvula', () => {
    const cajas = de('caja-valvula')
    expect(cajas.map((c) => c.id)).toEqual(['caja-valvula-salida'])
    const suelo = datos.accesorios.terreno.nivelSuelo.valor
    for (const c of cajas) expect(c.posicion[1] - caja(c).tamano[1] / 2).toBeCloseTo(suelo)
    expect(de('varilla').map((v) => v.id)).toEqual(['varilla-salida'])
    expect(de('valvula').map((v) => v.id).sort()).toEqual(['valvula-ingreso', 'valvula-salida'])
  })

  it('la varilla llega hasta el tubo que maneja', () => {
    const baja = de('varilla').find((v) => v.id === 'varilla-salida')
    if (!baja) throw new Error('falta la varilla de la salida')
    const v = cilindro(baja)
    expect(v.posicion[1] - v.largo / 2).toBeCloseTo(1.425)
  })

  it('el relleno rodea el muro y el terreno natural rodea al relleno', () => {
    const relleno = de('relleno')[0]
    const terreno = de('terreno')[0]
    if (relleno.forma !== 'anillo' || terreno.forma !== 'anillo') throw new Error('deben ser anillos')
    expect(relleno.radioInterior).toBeCloseTo(3.99)
    expect(terreno.radioInterior).toBeCloseTo(relleno.radioExterior)
    // El relleno y el terreno natural llegan solo hasta el suelo real (el del terreno levantado), no hasta la losa de techo.
    expect(relleno.posicion[1] + relleno.alto).toBeCloseTo(datos.accesorios.terreno.nivelSuelo.valor)
    expect(relleno.posicion[1] + relleno.alto).toBeLessThan(TECHO)
    expect(terreno.posicion[1] + terreno.alto).toBeCloseTo(datos.accesorios.terreno.nivelSuelo.valor)
    const u = planta.unidades.find((x) => x.id === 'homogeneizador')!
    expect(Math.abs(u.cotaFondo.valor + datos.accesorios.terreno.nivelSuelo.valor - u.cotaSuperficie.valor)).toBeLessThanOrEqual(0.06)
    expect(datos.accesorios.terreno.nivelSuelo.demo).toBe(true)
    expect(relleno.posicion[1]).toBeCloseTo(-0.3 - 0.3 - 0.5)
  })
})
