import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/homogeneizador.json'
import { esquemaHomogeneizador } from './esquema'

type Registro = Record<string, Record<string, Record<string, unknown>>>
const copia = () => structuredClone(crudo) as unknown as Registro
type Registro4 = Record<string, Record<string, Record<string, Record<string, unknown>>>>
const copia4 = () => structuredClone(crudo) as unknown as Registro4

describe('datos/homogeneizador.json (tanque circular)', () => {
  it('cumple el esquema', () => {
    expect(esquemaHomogeneizador.safeParse(crudo).success).toBe(true)
  })

  it('trae las medidas del plano', () => {
    const t = esquemaHomogeneizador.parse(crudo).tanque
    expect(t.forma).toBe('circular')
    expect(t.diametroInterior.valor).toBe(7.58)
    expect(t.alturaUtil.valor).toBe(4.9)
  })

  it('las medidas estimadas llevan demo: true y las del plano no', () => {
    const d = esquemaHomogeneizador.parse(crudo)
    expect(d.demo).toBe(true)
    expect(d.ingreso.altura.demo).toBe(true)
    expect(d.agitador.diametroZonaMezcla.demo).toBe(true)
    expect(d.tanque.diametroInterior.demo).toBe(false)
  })

  it('rechaza una medida sin fuente', () => {
    const malo = copia()
    delete malo.tanque.diametroInterior.fuente
    expect(esquemaHomogeneizador.safeParse(malo).success).toBe(false)
  })

  it('rechaza medidas negativas o en cero', () => {
    const negativo = copia()
    negativo.tanque.alturaUtil.valor = -1
    expect(esquemaHomogeneizador.safeParse(negativo).success).toBe(false)
    const cero = copia()
    cero.tanque.diametroInterior.valor = 0
    expect(esquemaHomogeneizador.safeParse(cero).success).toBe(false)
  })

  it('rechaza una forma que no es circular', () => {
    const malo = copia() as unknown as { tanque: Record<string, unknown> }
    malo.tanque.forma = 'rectangular'
    expect(esquemaHomogeneizador.safeParse(malo).success).toBe(false)
  })

  it('rechaza medidas que no cuadran entre sí', () => {
    const exterior = copia()
    exterior.tanque.diametroExterior.valor = 9
    expect(esquemaHomogeneizador.safeParse(exterior).success).toBe(false)
    const total = copia()
    total.tanque.alturaTotal.valor = 6
    expect(esquemaHomogeneizador.safeParse(total).success).toBe(false)
  })

  it('rechaza una cantidad de agitadores con decimales', () => {
    const malo = copia()
    malo.agitador.cantidad.valor = 1.5
    expect(esquemaHomogeneizador.safeParse(malo).success).toBe(false)
  })

  describe('accesorios', () => {
    it('traen las medidas del plano y marcan como ejemplo las estimadas', () => {
      const a = esquemaHomogeneizador.parse(crudo).accesorios
      expect(a.baranda.altura.valor).toBe(1.05)
      expect(a.bocaAcceso.lado.valor).toBe(1)
      expect(a.portillo.ancho.valor).toBe(1)
      expect(a.baranda.altura.demo).toBe(false)
      expect(a.bocaAcceso.distanciaAlCentro.demo).toBe(true)
      expect(a.escalera.separacionPeldanos.demo).toBe(true)
    })

    it('rechaza un accesorio sin fuente o con medida negativa', () => {
      const sinFuente = copia4()
      delete sinFuente.accesorios.baranda.altura.fuente
      expect(esquemaHomogeneizador.safeParse(sinFuente).success).toBe(false)
      const negativa = copia4()
      negativa.accesorios.ventilacion.altura.valor = -0.5
      expect(esquemaHomogeneizador.safeParse(negativa).success).toBe(false)
    })

    it('rechaza si falta una sección de accesorios', () => {
      const malo = copia4() as unknown as { accesorios: Record<string, unknown> }
      delete malo.accesorios.escalera
      expect(esquemaHomogeneizador.safeParse(malo).success).toBe(false)
    })

    it('rechaza una cantidad de postes con decimales o menor que 4', () => {
      const decimales = copia4()
      decimales.accesorios.baranda.numeroPostes.valor = 10.5
      expect(esquemaHomogeneizador.safeParse(decimales).success).toBe(false)
      const pocos = copia4()
      pocos.accesorios.baranda.numeroPostes.valor = 3
      expect(esquemaHomogeneizador.safeParse(pocos).success).toBe(false)
    })

    it('rechaza accesorios que no caben', () => {
      const boca = copia4()
      boca.accesorios.bocaAcceso.distanciaAlCentro.valor = 3.9
      expect(esquemaHomogeneizador.safeParse(boca).success).toBe(false)
      const escalera = copia4()
      escalera.accesorios.escalera.separacionMuro.valor = 1.5
      expect(esquemaHomogeneizador.safeParse(escalera).success).toBe(false)
      const ventilacion = copia4()
      ventilacion.accesorios.ventilacion.distanciaAlCentro.valor = 3.99
      expect(esquemaHomogeneizador.safeParse(ventilacion).success).toBe(false)
      const caja = copia4()
      caja.accesorios.cajaValvula.distanciaAlMuro.valor = 20
      expect(esquemaHomogeneizador.safeParse(caja).success).toBe(false)
    })
  })
})
