import { describe, expect, it } from 'vitest'
import { alturaEn, cuadricula, terreno } from '../../nucleo/terreno'
import bombeoCrudo from '../../../datos/bombeo.json'
import { esquemaBombeo } from '../bombeo/esquema'
import { planta } from './index'
import { largoTramo, posicionTramo, pretratamiento } from './pretratamiento'

const bombeo = esquemaBombeo.parse(bombeoCrudo)

const malla = cuadricula(terreno)
const terrenoEn = (u: { x: { valor: number }; y: { valor: number } }): number => alturaEn(malla, u.x.valor, u.y.valor) ?? NaN

const MEDIDAS = ['rejas', 'desarenador', 'parshall', 'homogeneizador', 'camara-contacto']
const DERIVADAS = ['sedimentador-1', 'sedimentador-2', 'lechos-secado']
/** RAFA (T11): fondo derivado del terreno y la hoja; coronación = fondo + altura total del plano (7.25 m), 0.95 m sobre el terreno. */
const DEL_PLANO = ['rafa', 'percolador']
/** Estación de bombeo: cotas de ejemplo derivadas del terreno levantado y de la profundidad supuesta del cárcamo. */
const DEL_TERRENO = ['bombeo']
const MARCA_MEDIDA = 'medido del dibujo del perfil, ±0.2 m aprox. por confirmar'

describe('posiciones de datos/planta.json', () => {
  it('cada x e y dice de qué archivo y capa del DXF sale', () => {
    for (const u of planta.unidades) {
      for (const v of [u.x, u.y]) {
        expect(v.fuente, u.id).toContain('.dxf')
        expect(v.fuente, u.id).toMatch(/PTAR-TEXTO|PTAR-ESTRUCTURAS/)
      }
    }
  })

  it('cada unidad cae sobre el terreno levantado', () => {
    for (const u of planta.unidades) expect(alturaEn(malla, u.x.valor, u.y.valor), u.id).not.toBeNull()
  })

  it('cada unidad está clasificada como medida del perfil o derivada, sin dejar ninguna', () => {
    expect([...MEDIDAS, ...DERIVADAS, ...DEL_PLANO, ...DEL_TERRENO].sort()).toEqual(planta.unidades.map((u) => u.id).sort())
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

  it('el RAFA tiene fondo y coronación derivados y de ejemplo; su fondo queda bajo el terreno y su coronación sobre él', () => {
    const u = planta.unidades.find((x) => x.id === 'rafa')!
    for (const v of [u.cotaFondo, u.cotaCoronacion]) {
      expect(v.fuente).toContain('derivado')
      expect(v.demo).toBe(true)
    }
    expect(u.cotaFondo.valor).toBeLessThan(terrenoEn(u))
    expect(u.cotaCoronacion.valor - terrenoEn(u)).toBeCloseTo(0.95, 1)
  })

  it('el percolador tiene el fondo medido del perfil y la coronación derivada del plano (de ejemplo)', () => {
    const u = planta.unidades.find((x) => x.id === 'percolador')!
    expect(u.cotaFondo.fuente).toContain(MARCA_MEDIDA)
    expect(u.cotaFondo.demo).not.toBe(true)
    expect(u.cotaCoronacion.fuente).toContain('derivado')
    expect(u.cotaCoronacion.fuente).toContain('POR REVISAR CON EL PERFIL')
    expect(u.cotaCoronacion.demo).toBe(true)
  })

  it('el alto (coronación menos fondo) es positivo', () => {
    for (const u of planta.unidades) expect(u.cotaCoronacion.valor - u.cotaFondo.valor, u.id).toBeGreaterThan(0)
  })
})

describe('estación de bombeo EB-1', () => {
  const eb = planta.unidades.find((u) => u.id === 'bombeo')!

  it('su posición sale del círculo doble del mapa, y sus cotas son de ejemplo', () => {
    for (const v of [eb.cotaFondo, eb.cotaCoronacion]) expect(v.demo).toBe(true)
    for (const v of [eb.x, eb.y]) expect(v.demo).not.toBe(true)
    expect(eb.x.fuente).toContain('círculo doble')
    expect(eb.cotaCoronacion.fuente).toContain('derivado')
  })

  it('la coronación es la cota del terreno y el fondo queda a la profundidad del cárcamo bajo ella', () => {
    expect(Math.abs(eb.cotaCoronacion.valor - terrenoEn(eb))).toBeLessThanOrEqual(0.05)
    expect(eb.cotaCoronacion.valor - eb.cotaFondo.valor).toBeCloseTo(bombeo.carcamo.profundidad.valor, 6)
  })
})

describe('fila continua del pretratamiento', () => {
  const fila = ['rejas', 'desarenador', 'parshall'].map((id) => ({ id, u: planta.unidades.find((x) => x.id === id)!, largo: largoTramo(pretratamiento, id) }))

  it('las tres posiciones salen de datos/pretratamiento.json, no son de ejemplo', () => {
    for (const { id, u } of fila) {
      const p = posicionTramo(pretratamiento, id)
      expect(Math.abs(u.x.valor - p.x), id).toBeLessThanOrEqual(0.011)
      expect(Math.abs(u.y.valor - p.y), id).toBeLessThanOrEqual(0.011)
      expect(u.giro.valor, id).toBeCloseTo(p.giro, 1)
      for (const v of [u.x, u.y, u.giro]) expect(v.demo, id).not.toBe(true)
    }
  })

  it('las estructuras quedan pegadas: el final de una es el comienzo de la siguiente', () => {
    for (let i = 1; i < fila.length; i++) {
      const a = fila[i - 1]
      const b = fila[i]
      const g = (a.u.giro.valor * Math.PI) / 180
      const entreCentros = Math.hypot(b.u.x.valor - a.u.x.valor, b.u.y.valor - a.u.y.valor)
      expect(entreCentros).toBeCloseTo((a.largo + b.largo) / 2, 1)
      expect((b.u.x.valor - a.u.x.valor) / entreCentros).toBeCloseTo(Math.cos(g), 2)
    }
  })

  it('todas comparten un mismo giro y una misma superficie (una sola explanada)', () => {
    expect(new Set(fila.map(({ u }) => u.giro.valor)).size).toBe(1)
    expect(new Set(fila.map(({ u }) => u.cotaSuperficie.valor)).size).toBe(1)
    for (const { u } of fila) expect(u.cotaSuperficie.valor).toBe(u.cotaCoronacion.valor)
  })

  it('el largo de cada estructura armada desde su JSON es el del tramo medido en el DXF', async () => {
    const { disponer: rejas } = await import('../rejas/disposicion')
    const { disponer: desarenador } = await import('../desarenador/disposicion')
    const { disponer: parshall } = await import('../parshall/disposicion')
    const { esquemaRejas } = await import('../rejas/esquema')
    const { esquemaDesarenador } = await import('../desarenador/esquema')
    const { esquemaParshall } = await import('../parshall/esquema')
    const [r, d, p] = await Promise.all([import('../../../datos/rejas.json'), import('../../../datos/desarenador.json'), import('../../../datos/parshall.json')])
    expect(rejas(esquemaRejas.parse(r.default)).largoTotal).toBeCloseTo(fila[0].largo, 2)
    expect(desarenador(esquemaDesarenador.parse(d.default)).largoTotal).toBeCloseTo(fila[1].largo, 2)
    expect(parshall(esquemaParshall.parse(p.default)).largoTotal).toBeCloseTo(fila[2].largo, 2)
  })
})
