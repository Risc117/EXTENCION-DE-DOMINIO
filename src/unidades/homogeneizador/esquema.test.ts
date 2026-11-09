import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/homogeneizador.json'
import { esquemaHomogeneizador } from './esquema'
type Registro = Record<string, Record<string, Record<string, unknown>>>

describe('datos/homogeneizador.json', () => {
  it('cumple el esquema', () => {
    expect(esquemaHomogeneizador.safeParse(crudo).success).toBe(true)
  })

  it('está marcado como dato de ejemplo mientras no haya medidas reales', () => {
    expect(esquemaHomogeneizador.parse(crudo).demo).toBe(true)
  })

  it('rechaza una medida sin fuente', () => {
    const malo = structuredClone(crudo) as unknown as Registro
    delete malo.tanque.largo.fuente
    expect(esquemaHomogeneizador.safeParse(malo).success).toBe(false)
  })

  it('rechaza medidas negativas y cantidades con decimales', () => {
    const negativo = structuredClone(crudo) as unknown as Registro
    negativo.tanque.ancho.valor = -1
    expect(esquemaHomogeneizador.safeParse(negativo).success).toBe(false)
    const decimal = structuredClone(crudo) as unknown as Registro
    decimal.difusores.cantidad.valor = 2.5
    expect(esquemaHomogeneizador.safeParse(decimal).success).toBe(false)
  })
})
