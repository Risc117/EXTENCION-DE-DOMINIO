import { describe, expect, it } from 'vitest'
import planta from '../../../datos/planta.json'
import { entorno } from './datos'
import { distanciaAPolilinea } from './cruceCamino'
import { vegetacion as datos, esquemaVegetacion } from './datosVegetacion'
import { cercoCerrado, enPoligono, repartirVegetacion, restriccionesDeEntorno } from './vegetacion'
import { alturaNivelada } from './terrenoNivelado'

type P = { x: number; y: number }
const cuadrado: P[] = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }]

describe('punto en polígono', () => {
  it('dentro y fuera de un cuadrado', () => {
    expect(enPoligono({ x: 5, y: 5 }, cuadrado)).toBe(true)
    expect(enPoligono({ x: 15, y: 5 }, cuadrado)).toBe(false)
  })
})

describe('datos de la vegetación de los alrededores', () => {
  it('son Dato de ejemplo con fuente y menos en calidad baja que en alta', () => {
    for (const c of [datos.arboles.cantidad, datos.arbustos.cantidad, datos.pasto.cantidad]) {
      expect(c.demo).toBe(true)
      expect(c.baja).toBeLessThanOrEqual(c.alta)
      expect(c.fuente).toContain('No está en las fuentes')
    }
    expect(datos.arboles.cantidad.baja).toBeLessThan(datos.arboles.cantidad.alta)
  })
  it('el esquema rechaza más vegetación en baja que en alta y márgenes en cero', () => {
    const a = structuredClone(datos)
    a.arbustos.cantidad.baja = a.arbustos.cantidad.alta + 1
    expect(esquemaVegetacion.safeParse(a).success).toBe(false)
    const b = structuredClone(datos)
    b.margenCerco.valor = 0
    expect(esquemaVegetacion.safeParse(b).success).toBe(false)
  })
})

describe('reparto de la vegetación con los datos reales', () => {
  const r = restriccionesDeEntorno(datos)
  const alta = repartirVegetacion(r, datos.arboles.cantidad.alta, datos.semilla.valor)
  it('da la cantidad pedida', () => {
    expect(alta).toHaveLength(datos.arboles.cantidad.alta)
  })
  it('es siempre la misma con la misma semilla y la de calidad baja son las primeras de la alta', () => {
    expect(repartirVegetacion(r, datos.arboles.cantidad.alta, datos.semilla.valor)).toEqual(alta)
    expect(repartirVegetacion(r, datos.arboles.cantidad.baja, datos.semilla.valor)).toEqual(alta.slice(0, datos.arboles.cantidad.baja))
  })
  it('todos están fuera del cerco y a más del margen de él', () => {
    const anillo = cercoCerrado(entorno.cerco.trazos)
    for (const p of alta) {
      expect(enPoligono(p, anillo)).toBe(false)
      expect(distanciaAPolilinea(p, anillo)).toBeGreaterThanOrEqual(datos.margenCerco.valor)
    }
  })
  it('ninguno cae en el río ni a menos del margen de sus orillas', () => {
    const orillas = [...entorno.rio.margenesA, entorno.rio.margenB]
    const cauce = [...entorno.rio.margenesA.flat(), ...[...entorno.rio.margenB].reverse()]
    for (const p of alta) {
      expect(enPoligono(p, cauce)).toBe(false)
      for (const o of orillas) expect(distanciaAPolilinea(p, o)).toBeGreaterThanOrEqual(datos.margenRio.valor)
    }
  })
  it('ninguno tapa el camino: a más del margen de sus dos bordes', () => {
    for (const p of alta) {
      for (const b of [...entorno.camino.margenesA, entorno.camino.margenB]) expect(distanciaAPolilinea(p, b)).toBeGreaterThanOrEqual(datos.margenCamino.valor)
    }
  })
  it('todos están sobre el terreno recortado (con altura) y lejos de las unidades', () => {
    for (const p of alta) {
      expect(Number.isFinite(alturaNivelada(p.x, p.y))).toBe(true)
      for (const u of planta.unidades) expect(Math.hypot(p.x - u.x.valor, p.y - u.y.valor)).toBeGreaterThan(datos.margenCerco.valor)
    }
  })
  it('traen giro y escala dentro de lo pedido', () => {
    for (const p of alta) {
      expect(p.escala).toBeGreaterThanOrEqual(datos.variacionEscala.valor.minima)
      expect(p.escala).toBeLessThanOrEqual(datos.variacionEscala.valor.maxima)
    }
  })
  it('se reparten por varios lados (no todos en un rincón)', () => {
    const xs = alta.map((p) => p.x)
    const ys = alta.map((p) => p.y)
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(60)
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(60)
  })
})

describe('reparto con restricciones simples', () => {
  const simple = {
    cerco: cuadrado,
    margenCerco: 2,
    cauce: [{ x: 20, y: -50 }, { x: 25, y: -50 }, { x: 25, y: 50 }, { x: 20, y: 50 }],
    orillas: [[{ x: 20, y: -50 }, { x: 20, y: 50 }], [{ x: 25, y: -50 }, { x: 25, y: 50 }]],
    margenRio: 2,
    bordesCamino: [] as P[][],
    margenCamino: 2,
    region: { x0: -30, x1: 40, y0: -30, y1: 40 },
    alturaSuelo: () => 0,
  }
  it('respeta el cerco y el río', () => {
    const pts = repartirVegetacion(simple, 200, 3)
    expect(pts).toHaveLength(200)
    for (const p of pts) {
      expect(enPoligono(p, cuadrado) || distanciaAPolilinea(p, [...cuadrado, cuadrado[0]]) < 2).toBe(false)
      expect(p.x < 18 || p.x > 27).toBe(true)
    }
  })
  it('no cuelga: si no hay lugar devuelve las que cupieron', () => {
    const sinLugar = { ...simple, alturaSuelo: () => Number.NEGATIVE_INFINITY }
    expect(repartirVegetacion(sinLugar, 10, 3)).toHaveLength(0)
  })
})
