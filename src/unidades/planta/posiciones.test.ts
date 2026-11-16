import { describe, expect, it } from 'vitest'
import { alturaEn, cuadricula, terreno } from '../../nucleo/terreno'
import { planta } from './index'

const malla = cuadricula(terreno)
const terrenoEn = (u: { x: { valor: number }; y: { valor: number } }): number => alturaEn(malla, u.x.valor, u.y.valor) ?? NaN

const MEDIDAS = ['rejas', 'desarenador', 'parshall', 'homogeneizador', 'percolador', 'camara-contacto']
const DERIVADAS = ['rafa', 'sedimentador-1', 'sedimentador-2', 'lechos-secado']
const MARCA_MEDIDA = 'medido del dibujo del perfil, ±0.2 m aprox. por confirmar'

describe('posiciones de datos/planta.json', () => {
  it('cada x e y dice de qué archivo y capa del DXF sale', () => {
    for (const u of planta.unidades) {
      for (const v of [u.x, u.y]) {
        expect(v.fuente, u.id).toContain('.dxf')
        expect(v.fuente, u.id).toContain('PTAR-TEXTO')
      }
    }
  })

  it('cada unidad cae sobre el terreno levantado', () => {
    for (const u of planta.unidades) expect(alturaEn(malla, u.x.valor, u.y.valor), u.id).not.toBeNull()
  })

  it('cada unidad está clasificada como medida del perfil o derivada, sin dejar ninguna', () => {
    expect([...MEDIDAS, ...DERIVADAS].sort()).toEqual(planta.unidades.map((u) => u.id).sort())
  })
})

describe('cotas de fondo y coronación', () => {
  it('las medidas del perfil dicen cómo se midieron y de qué archivo y capa', () => {
    for (const id of MEDIDAS) {
      const u = planta.unidades.find((x) => x.id === id)!
      for (const v of [u.cotaFondo, u.cotaCoronacion]) {
        expect(v.fuente, id).toContain(MARCA_MEDIDA)
        expect(v.fuente, id).toContain('LUGAR PROYECTADO FINAL MEJORADO.dxf')
        expect(v.demo, id).not.toBe(true)
      }
    }
  })

  it('las derivadas dicen que son derivadas, y siguen como dato de ejemplo', () => {
    for (const id of DERIVADAS) {
      const u = planta.unidades.find((x) => x.id === id)!
      for (const v of [u.cotaFondo, u.cotaCoronacion]) {
        expect(v.fuente, id).toContain('derivado')
        expect(v.demo, id).toBe(true)
      }
      expect(u.cotaFondo.fuente, id).toContain('CALCULOS PTAR SANTA LEONOR.xlsx')
    }
  })

  it('la coronación derivada es la cota del terreno en la posición de la unidad', () => {
    for (const id of DERIVADAS) {
      const u = planta.unidades.find((x) => x.id === id)!
      expect(Math.abs(u.cotaCoronacion.valor - terrenoEn(u)), id).toBeLessThanOrEqual(0.05)
    }
  })

  it('las derivadas quedan enterradas hasta el terreno y nunca asomando por debajo de él', () => {
    for (const id of DERIVADAS) {
      const u = planta.unidades.find((x) => x.id === id)!
      expect(u.cotaFondo.valor, id).toBeLessThan(terrenoEn(u))
    }
  })

  it('la cámara de rejas, medida del perfil, queda bajo el terreno (enterrada: se ve con el corte)', () => {
    const u = planta.unidades.find((x) => x.id === 'rejas')!
    expect(u.cotaCoronacion.valor).toBeLessThan(terrenoEn(u))
  })

  it('el alto (coronación menos fondo) es positivo', () => {
    for (const u of planta.unidades) expect(u.cotaCoronacion.valor - u.cotaFondo.valor, u.id).toBeGreaterThan(0)
  })
})

describe('separación en fila del pretratamiento', () => {
  it('las unidades que el plano no separa (desarenador y Parshall) se marcan como ejemplo', () => {
    for (const id of ['desarenador', 'parshall']) expect(planta.unidades.find((u) => u.id === id)?.y.demo).toBe(true)
  })
})
