import { describe, expect, it } from 'vitest'
import { alturaEn, cuadricula, terreno } from '../../nucleo/terreno'
import { unidades } from '../registro'
import { planta } from './index'

const malla = cuadricula(terreno)
const de = (id: string) => planta.unidades.find((u) => u.id === id)!
const terrenoRedondeado = (id: string) => Math.round((alturaEn(malla, de(id).x.valor, de(id).y.valor) ?? NaN) * 10) / 10

/**
 * Centros reales de cada estructura en insumos/DFX/LUGAR PROYECTADO FINAL MEJORADO.dxf (m locales: UTM − (309340, 8791260)).
 * RAFA y percolador salen de sus bloques ("RAFA PLANTA" y "FILTRO PERCOLADOR PLANTA"); las demás, de círculos y rectángulos del plano.
 */
const CENTROS_DXF: Record<string, { x: number; y: number; giro: number }> = {
  'camara-reparto': { x: 4.0, y: 49.5, giro: 0 },
  percolador: { x: -9.0, y: 31.0, giro: 66.95 },
  'lechos-secado': { x: 5.5, y: -7.0, giro: 0 },
  homogeneizador: { x: -26.1, y: -21.5, giro: 0 },
  'sedimentador-1': { x: 22.85, y: 48.31, giro: 0 },
  'sedimentador-2': { x: 13.86, y: 39.62, giro: 0 },
  rafa: { x: -22.59, y: -0.03, giro: 81.77 },
  'camara-contacto': { x: 38.27, y: 40.22, giro: 34.9 },
}

describe('T9.6 · posiciones fieles al plano general', () => {
  it('cada unidad está en el centro real de su estructura en el DXF (menos de 0.1 m) y con su giro', () => {
    for (const [id, c] of Object.entries(CENTROS_DXF)) {
      const u = de(id)
      expect(Math.abs(u.x.valor - c.x), `${id} x`).toBeLessThan(0.1)
      expect(Math.abs(u.y.valor - c.y), `${id} y`).toBeLessThan(0.1)
      expect(Math.abs(u.giro.valor - c.giro), `${id} giro`).toBeLessThan(0.1)
    }
  })

  it('la fuente de x e y dice que es el centro de la estructura en el DXF y no el punto del rótulo', () => {
    for (const id of Object.keys(CENTROS_DXF)) {
      for (const v of [de(id).x, de(id).y]) {
        expect(v.fuente, id).toContain('LUGAR PROYECTADO FINAL MEJORADO.dxf')
        expect(v.fuente, id).toContain('centro')
        expect(v.fuente, id).not.toContain('punto del rótulo')
      }
    }
  })

  it('el efluente del RAFA va hacia el percolador: su +x (efluente) apunta del RAFA hacia el percolador', () => {
    const r = de('rafa')
    const p = de('percolador')
    const eje = [Math.cos((r.giro.valor * Math.PI) / 180), Math.sin((r.giro.valor * Math.PI) / 180)]
    const haciaPercolador = [p.x.valor - r.x.valor, p.y.valor - r.y.valor]
    expect(eje[0] * haciaPercolador[0] + eje[1] * haciaPercolador[1]).toBeGreaterThan(0)
  })

  it('el lado largo del RAFA queda casi paralelo a la fila del pretratamiento (menos de 15°)', () => {
    const diferencia = Math.abs((de('rafa').giro.valor - de('rejas').giro.valor + 180) % 180)
    expect(Math.min(diferencia, 180 - diferencia)).toBeLessThan(15)
  })

  it('homogeneizador y sedimentadores siguen en 0° (son circulares)', () => {
    for (const id of ['homogeneizador', 'sedimentador-1', 'sedimentador-2']) expect(de(id).giro.valor).toBe(0)
  })

  it('el pretratamiento y EB-1 no cambiaron y coinciden con el DXF', () => {
    expect([de('bombeo').x.valor, de('bombeo').y.valor]).toEqual([-3, -69.5])
    const previstos: Record<string, [number, number]> = { rejas: [-26.59, -49.9], desarenador: [-27.05, -45.25], parshall: [-27.55, -40.27] }
    for (const [id, [x, y]] of Object.entries(previstos)) {
      expect(de(id).x.valor, id).toBeCloseTo(x, 2)
      expect(de(id).y.valor, id).toBeCloseTo(y, 2)
      expect(de(id).giro.valor, id).toBeCloseTo(95.7, 6)
    }
    // El fin del Parshall cae en el extremo de las paredes de la fila del DXF: (−27.7, −38.6).
    const p = de('parshall')
    const g = (p.giro.valor * Math.PI) / 180
    const fin = [p.x.valor + 1.4 * Math.cos(g), p.y.valor + 1.4 * Math.sin(g)]
    expect(Math.hypot(fin[0] + 27.7, fin[1] + 38.6)).toBeLessThan(0.4)
  })
})

describe('T9.6 · cotas recalculadas en el lugar nuevo', () => {
  it('la superficie de cada unidad derivada del terreno es el terreno de su lugar (redondeado a 0.1 m)', () => {
    for (const id of ['rafa', 'sedimentador-1', 'sedimentador-2', 'camara-reparto', 'lechos-secado']) {
      expect(de(id).cotaSuperficie.valor, id).toBeCloseTo(terrenoRedondeado(id), 6)
    }
  })

  it('RAFA: fondo = terreno − altura de la hoja; RAFA y sedimentadores: coronación = fondo + altura del plano (el fondo de los sedimentadores sale del perfil, T16.4)', () => {
    expect(terrenoRedondeado('rafa') - de('rafa').cotaFondo.valor).toBeCloseTo(6.3, 6)
    expect(de('rafa').cotaCoronacion.valor - de('rafa').cotaFondo.valor).toBeCloseTo(7.25, 6)
    for (const id of ['sedimentador-1', 'sedimentador-2']) {
      expect(de(id).cotaFondo.valor, id).toBeCloseTo(2972.34, 2)
      expect(de(id).cotaCoronacion.valor - de(id).cotaFondo.valor, id).toBeCloseTo(6.8643, 6)
    }
  })

  it('cámara de reparto y lechos: coronación = terreno; fondo = coronación − su altura', () => {
    expect(de('camara-reparto').cotaCoronacion.valor).toBeCloseTo(terrenoRedondeado('camara-reparto'), 6)
    expect(de('camara-reparto').cotaCoronacion.valor - de('camara-reparto').cotaFondo.valor).toBeCloseTo(1.2, 6)
    expect(de('lechos-secado').cotaCoronacion.valor).toBeCloseTo(terrenoRedondeado('lechos-secado'), 6)
    expect(de('lechos-secado').cotaCoronacion.valor - de('lechos-secado').cotaFondo.valor).toBeCloseTo(0.4, 6)
  })

  it('las cotas del perfil no cambian: homogeneizador y percolador', () => {
    expect([de('homogeneizador').cotaFondo.valor, de('homogeneizador').cotaCoronacion.valor]).toEqual([2985.25, 2990.65])
    expect(de('percolador').cotaFondo.valor).toBe(2980.74)
  })

  it('la cámara de reparto queda más baja que el percolador (el agua baja por gravedad)', () => {
    expect(de('camara-reparto').cotaCoronacion.valor).toBeLessThan(de('percolador').cotaFondo.valor)
  })

  it('las cotas recalculadas siguen como dato de ejemplo y dicen que son derivadas', () => {
    for (const id of ['rafa', 'sedimentador-1', 'sedimentador-2', 'camara-reparto', 'lechos-secado']) {
      for (const v of [de(id).cotaFondo, de(id).cotaCoronacion, de(id).cotaSuperficie]) {
        expect(v.demo, id).toBe(true)
        expect(v.fuente, id).toContain('derivado')
      }
    }
  })
})

describe('T9.6 · ninguna unidad pisa a otra', () => {
  const fila = new Set(['rejas', 'desarenador', 'parshall'])
  const pares = unidades.flatMap((a, i) => unidades.slice(i + 1).map((b) => [a, b] as const)).filter(([a, b]) => !(fila.has(a.id) && fila.has(b.id)))

  it('las huellas (círculo de su tamaño) no se cruzan, en todos los pares', () => {
    expect(pares.length).toBeGreaterThan(40)
    for (const [a, b] of pares) {
      const d = Math.hypot(a.posicion.x - b.posicion.x, a.posicion.y - b.posicion.y)
      expect(d, `${a.id} con ${b.id}`).toBeGreaterThanOrEqual((a.tamano + b.tamano) / 2)
    }
  })

  it('las explanadas (piso plano) no se cruzan, en todos los pares', () => {
    for (const [a, b] of pares) {
      const ra = de(a.id).radioExplanada.valor
      const rb = de(b.id).radioExplanada.valor
      const d = Math.hypot(a.posicion.x - b.posicion.x, a.posicion.y - b.posicion.y)
      expect(d, `${a.id} con ${b.id}`).toBeGreaterThanOrEqual(ra + rb)
    }
  })

  it('las unidades de la fila del pretratamiento van pegadas pero no se montan (distancia entre centros = suma de mitades)', () => {
    const f = unidades.filter((u) => fila.has(u.id))
    for (let i = 0; i < f.length; i++) {
      for (let j = i + 1; j < f.length; j++) {
        const d = Math.hypot(f[i].posicion.x - f[j].posicion.x, f[i].posicion.y - f[j].posicion.y)
        expect(d, `${f[i].id} con ${f[j].id}`).toBeGreaterThanOrEqual((f[i].tamano + f[j].tamano) / 2 - 0.05)
      }
    }
  })
})
