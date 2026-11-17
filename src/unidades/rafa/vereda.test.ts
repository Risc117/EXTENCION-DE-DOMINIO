import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/rafa.json'
import { seguridad } from '../comun/datosSeguridad'
import type { Pieza } from '../comun/tipos'
import { disponer } from './disposicion'
import { esquemaRafa } from './esquema'
import { construirPiezas } from './geometria'
import { construirVereda } from './vereda'

const datos = esquemaRafa.parse(crudo)
const s = disponer(datos)
const piezas = construirVereda(datos, seguridad.rafa)
const cajas = piezas.filter((p): p is Extract<Pieza, { forma: 'caja' }> => p.forma === 'caja')
const limites = (p: Extract<Pieza, { forma: 'caja' }>) => ({ x0: p.pos[0] - p.tam[0] / 2, x1: p.pos[0] + p.tam[0] / 2, z0: p.pos[2] - p.tam[2] / 2, z1: p.pos[2] + p.tam[2] / 2, y0: p.pos[1] - p.tam[1] / 2, y1: p.pos[1] + p.tam[1] / 2 })

describe('datos de seguridad', () => {
  it('la huella total del RAFA viene del plano (no es de ejemplo) y el resto es Dato de ejemplo', () => {
    expect(seguridad.rafa.largoTotal.valor).toBe(18)
    expect(seguridad.rafa.anchoTotal.valor).toBe(6.75)
    expect(seguridad.rafa.largoTotal.demo).toBe(false)
    expect(seguridad.rafa.largoTotal.fuente).toContain('16 nov')
    for (const m of [seguridad.rafa.espesorVereda, seguridad.rafa.alturaBaranda, seguridad.rafa.separacionPostes, ...Object.values(seguridad.emergencia)]) expect(m.demo).toBe(true)
  })
  it('la huella total es mayor que la estructura (15.2 × 5.7 m)', () => {
    expect(seguridad.rafa.largoTotal.valor).toBeGreaterThan(datos.cuerpo.largoExterior.valor)
    expect(seguridad.rafa.anchoTotal.valor).toBeGreaterThan(datos.cuerpo.anchoExterior.valor)
  })
})

describe('vereda de mantenimiento del RAFA', () => {
  const losas = cajas.filter((p) => p.id.startsWith('vereda-'))
  it('rodea la estructura: sus bordes de afuera miden 18.0 × 6.75 m', () => {
    const l = losas.map(limites)
    expect(Math.max(...l.map((b) => b.x1)) - Math.min(...l.map((b) => b.x0))).toBeCloseTo(18, 9)
    expect(Math.max(...l.map((b) => b.z1)) - Math.min(...l.map((b) => b.z0))).toBeCloseTo(6.75, 9)
  })
  it('sus bordes de adentro pegan con el contorno de la estructura (15.2 × 5.7 m): sin hueco y sin pisarla', () => {
    const l = losas.map(limites)
    const [ex, ez] = [s.semiLargo, s.semiAncho]
    // Franjas de los lados: del borde de la estructura hacia afuera; franjas de los extremos: del borde en x hacia afuera.
    expect(l.some((b) => Math.abs(b.z0 - ez) < 1e-9 && b.x0 <= -ex + 1e-9 && b.x1 >= ex - 1e-9)).toBe(true)
    expect(l.some((b) => Math.abs(b.z1 + ez) < 1e-9 && b.x0 <= -ex + 1e-9 && b.x1 >= ex - 1e-9)).toBe(true)
    expect(l.some((b) => Math.abs(b.x0 - ex) < 1e-9)).toBe(true)
    expect(l.some((b) => Math.abs(b.x1 + ex) < 1e-9)).toBe(true)
    for (const b of l) {
      const dentro = b.x0 < ex - 1e-9 && b.x1 > -ex + 1e-9 && b.z0 < ez - 1e-9 && b.z1 > -ez + 1e-9
      expect(dentro, 'la losa no debe pisar el cuerpo').toBe(false)
    }
  })
  it('está al nivel de la parte alta del cuerpo (la coronación) y mide lo que dice el espesor', () => {
    for (const b of losas.map(limites)) {
      expect(b.y1).toBeCloseTo(s.yLosa, 9)
      expect(b.y1 - b.y0).toBeCloseTo(seguridad.rafa.espesorVereda.valor, 9)
    }
  })
})

describe('baranda de seguridad del RAFA', () => {
  const postes = piezas.filter((p) => p.id.startsWith('poste-'))
  it('tiene postes en las cuatro esquinas del contorno de 18.0 × 6.75 m', () => {
    const pos = postes.map((p) => [Math.round(p.pos[0] * 1000) / 1000, Math.round(p.pos[2] * 1000) / 1000])
    for (const [x, z] of [[9, 3.375], [9, -3.375], [-9, 3.375], [-9, -3.375]]) expect(pos).toContainEqual([x, z])
  })
  it('todos los postes están sobre el contorno de afuera y a la separación pedida o menos entre vecinos', () => {
    for (const p of postes) {
      const [x, z] = [Math.abs(p.pos[0]), Math.abs(p.pos[2])]
      expect(Math.abs(x - 9) < 1e-6 || Math.abs(z - 3.375) < 1e-6).toBe(true)
    }
    const lado = postes.filter((p) => Math.abs(p.pos[2] - 3.375) < 1e-6).map((p) => p.pos[0]).sort((a, b) => a - b)
    for (let i = 1; i < lado.length; i++) expect(lado[i] - lado[i - 1]).toBeLessThanOrEqual(seguridad.rafa.separacionPostes.valor + 1e-9)
  })
  it('los postes miden la altura de la baranda sobre la vereda y los pasamanos van arriba', () => {
    const alto = seguridad.rafa.alturaBaranda.valor
    for (const p of postes.filter((q) => q.forma === 'caja')) expect((p as Extract<Pieza, { forma: 'caja' }>).tam[1]).toBeCloseTo(alto, 9)
    const rieles = cajas.filter((p) => p.id.startsWith('pasamanos-'))
    expect(rieles.length).toBe(8)
    for (const r of rieles) expect(limites(r).y1).toBeLessThanOrEqual(s.yLosa + alto + 1e-9)
  })
  it('las barandas son accesorios (se ocultan con el interruptor de accesorios) y todas las piezas tienen id único', () => {
    for (const p of piezas.filter((q) => q.id.startsWith('poste-') || q.id.startsWith('pasamanos-'))) expect(p.accesorio).toBe(true)
    expect(new Set(piezas.map((p) => p.id)).size).toBe(piezas.length)
  })
})

describe('el RAFA completo', () => {
  it('construirPiezas incluye la vereda y la baranda sin repetir ids con las piezas anteriores', () => {
    const todas = construirPiezas(datos, false)
    expect(todas.some((p) => p.id.startsWith('vereda-'))).toBe(true)
    expect(todas.some((p) => p.id.startsWith('poste-'))).toBe(true)
    expect(new Set(todas.map((p) => p.id)).size).toBe(todas.length)
  })
})
