import { describe, expect, it } from 'vitest'
import { CURVAS_DETALLE, CURVAS_PRINCIPALES, DISTANCIA_CURVAS_DETALLE, terreno } from '../../nucleo/terreno'
import { unidades } from '../../unidades/registro'
import { encuadre } from '../encuadre'
import { hayDetalleCurvas, radioCamara } from './detalleCurvas'

describe('detalle de las curvas de nivel', () => {
  it('de lejos solo van las principales (cada 5 m) y el detalle son las de cada metro', () => {
    const principales = terreno.curvas.filter((c) => CURVAS_PRINCIPALES.includes(c.tipo))
    expect(principales.length).toBeGreaterThan(0)
    expect(principales.every((c) => c.cota % 5 === 0)).toBe(true)
    const detalle = terreno.curvas.filter((c) => CURVAS_DETALLE.includes(c.tipo))
    expect(detalle.every((c) => c.cota % 5 !== 0)).toBe(true)
    expect(principales.length + detalle.length).toBe(terreno.curvas.length)
  })

  it('el detalle aparece al acercar la cámara y se va al alejarla', () => {
    expect(hayDetalleCurvas(DISTANCIA_CURVAS_DETALLE)).toBe(true)
    expect(hayDetalleCurvas(DISTANCIA_CURVAS_DETALLE + 1)).toBe(false)
  })

  it('el radio es la distancia relativa por la escala del encuadre', () => {
    expect(radioCamara(unidades, null, 2)).toBeCloseTo(2 * encuadre(unidades, null).escala)
  })

  it('en la vista general no hay detalle y al ir a una unidad sí', () => {
    const distanciaInicial = 3
    expect(hayDetalleCurvas(radioCamara(unidades, null, distanciaInicial))).toBe(false)
    expect(hayDetalleCurvas(radioCamara(unidades, 'homogeneizador', distanciaInicial))).toBe(true)
  })
})
