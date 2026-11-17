import { describe, expect, it } from 'vitest'
import { cercoCerrado, enPoligono } from '../entorno/vegetacion'
import { distanciaAPolilinea } from '../entorno/cruceCamino'
import { entorno } from '../entorno/datos'
import { alturaNivelada } from '../entorno/terrenoNivelado'
import { planta } from '../planta'
import { conexiones as datos } from './datos'
import { velocidadTramo } from './flujo'

const tramo = (id: string) => datos.tramos.find((t) => t.id === id)!
const impulsion = tramo('T31')
const salida = tramo('T30')
const pozo = datos.puntos.find((p) => p.id === 'BZ-D')!

describe('retorno del drenaje de los lechos al cárcamo (T34, decisión del usuario del 17 nov: impulsión con bomba)', () => {
  it('el drenaje sale de los lechos a un pozo (BZ-D) y de ahí una impulsión sube al cárcamo (bombeo)', () => {
    expect(salida).toMatchObject({ desde: 'lechos-secado', hasta: 'BZ-D', caudal: 'drenaje', linea: 'agua-residual' })
    expect(impulsion).toMatchObject({ desde: 'BZ-D', hasta: 'bombeo', caudal: 'drenaje', linea: 'impulsion' })
    expect(pozo.tipo).toBe('buzon')
    expect(pozo.nombre).toMatch(/bomba/i)
  })
  it('es Dato de ejemplo y por confirmar (posición, diámetros, cotas y material)', () => {
    for (const t of [salida, impulsion]) {
      expect(t.diametro.demo).toBe(true)
      expect(t.cotaSalida.demo).toBe(true)
      expect(t.cotaLlegada.demo).toBe(true)
      expect(t.fuenteTrazado).toMatch(/por confirmar/i)
    }
    expect(pozo.x.demo).toBe(true)
    expect(pozo.y.demo).toBe(true)
  })
  it('la impulsión empieza en el pozo y termina en el borde del cárcamo (a menos de su radio exterior)', () => {
    const t = impulsion.trazado
    expect(Math.hypot(t[0].x - pozo.x.valor, t[0].y - pozo.y.valor)).toBeLessThan(0.5)
    const b = planta.unidades.find((u) => u.id === 'bombeo')!
    expect(Math.hypot(t[t.length - 1].x - b.x.valor, t[t.length - 1].y - b.y.valor)).toBeLessThan(1.9)
  })
  it('el recorrido no atraviesa edificios y se queda dentro del cerco', () => {
    const cerco = cercoCerrado(entorno.cerco.trazos)
    const pts = impulsion.trazado
    for (let i = 1; i < pts.length; i++) {
      const largo = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
      for (let k = 0; k <= Math.ceil(largo / 0.5); k++) {
        const f = k / Math.ceil(largo / 0.5)
        const p = { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f }
        expect(enPoligono(p, cerco), `(${p.x.toFixed(1)}, ${p.y.toFixed(1)}) fuera del cerco`).toBe(true)
        for (const e of entorno.edificios) expect(enPoligono(p, e.poligono), `dentro de ${e.id}`).toBe(false)
      }
    }
    expect(distanciaAPolilinea(pts[0], [...cerco, cerco[0]])).toBeGreaterThan(1)
  })
  it('sube (es una impulsión): cada vértice queda enterrado a la cobertura de ejemplo bajo el terreno y la cota sube del pozo al cárcamo', () => {
    const cota = impulsion.trazado.map((p) => p.cota ?? null)
    expect(impulsion.cotaLlegada.valor).toBeGreaterThan(impulsion.cotaSalida.valor + 5)
    for (const p of impulsion.trazado) {
      if (p.cota !== undefined) expect(p.cota).toBeCloseTo(alturaNivelada(p.x, p.y) - datos.cobertura.valor, 1)
    }
    expect(cota.length).toBe(impulsion.trazado.length)
  })
  it('las cotas del tubo de drenaje son el terreno menos la cobertura y empalma con la impulsión (misma cota en el pozo)', () => {
    for (const [valor, p] of [[salida.cotaSalida.valor, salida.trazado[0]], [salida.cotaLlegada.valor, salida.trazado[1]]] as const) expect(valor).toBeCloseTo(alturaNivelada(p.x, p.y) - datos.cobertura.valor, 1)
    expect(salida.cotaLlegada.valor).toBeCloseTo(impulsion.cotaSalida.valor, 9)
  })
  it('la impulsión queda fuera del radio de seguridad del grupo electrógeno y lejos de las unidades', () => {
    const r = entorno.radiosSeguridad[0]
    expect(distanciaAPolilinea(r.centro, impulsion.trazado)).toBeGreaterThan(r.radio.valor)
    for (const u of planta.unidades.filter((q) => q.id !== 'bombeo' && q.id !== 'lechos-secado')) expect(distanciaAPolilinea({ x: u.x.valor, y: u.y.valor }, impulsion.trazado)).toBeGreaterThan(3)
  })
  it('el agua del drenaje corre despacio por la tubería (caudal chico)', () => {
    const c = { entrada: 6.5, salida: 6.5, promedio: 6.5 }
    expect(velocidadTramo('drenaje', c)).toBeGreaterThan(0)
    expect(velocidadTramo('drenaje', c)).toBeLessThan(velocidadTramo('entrada', c))
  })
})
