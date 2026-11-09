import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/homogeneizador.json'
import { esquemaHomogeneizador } from './esquema'
import { construirPiezas } from './geometria'

const datos = esquemaHomogeneizador.parse(crudo)
const porTipo = (tipo: string, d = datos) => construirPiezas(d).filter((p) => p.tipo === tipo)

describe('construirPiezas', () => {
  it('arma piso, 4 muros, ingreso, salida y los difusores del JSON', () => {
    expect(porTipo('piso')).toHaveLength(1)
    expect(porTipo('muro')).toHaveLength(4)
    expect(porTipo('ingreso')).toHaveLength(1)
    expect(porTipo('salida')).toHaveLength(1)
    expect(porTipo('difusor')).toHaveLength(datos.difusores.cantidad.valor)
  })

  it('cambiar una medida del JSON cambia el tanque', () => {
    const otro = structuredClone(datos)
    otro.tanque.largo.valor = 20
    otro.difusores.cantidad.valor = 6
    const ancho = (d: typeof datos) => {
      const piso = porTipo('piso', d)[0]
      return piso.forma === 'caja' ? piso.tamano[0] : 0
    }
    expect(ancho(otro)).toBeGreaterThan(ancho(datos))
    expect(porTipo('difusor', otro)).toHaveLength(6)
  })

  it('ingreso y salida quedan en lados opuestos', () => {
    expect(porTipo('ingreso')[0].posicion[0]).toBeLessThan(0)
    expect(porTipo('salida')[0].posicion[0]).toBeGreaterThan(0)
  })

  it('los difusores quedan dentro del tanque', () => {
    for (const d of porTipo('difusor')) {
      expect(Math.abs(d.posicion[0])).toBeLessThan(datos.tanque.largo.valor / 2)
    }
  })
})
