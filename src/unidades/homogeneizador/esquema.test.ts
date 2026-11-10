import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/homogeneizador.json'
import { esquemaHomogeneizador } from './esquema'

type Registro = Record<string, Record<string, Record<string, unknown>>>
const copia = () => structuredClone(crudo) as unknown as Registro

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
})
