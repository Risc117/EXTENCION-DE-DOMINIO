import { describe, expect, it } from 'vitest'
import type { DatosPerfil } from '../estado/perfil'
import { MIN_ANCHO_UNIDAD_PERFIL } from '../nucleo/constantesPerfil'
import { filasTablaPerfil, geometriaPerfil } from './vistaPerfil'

const perfil: DatosPerfil = {
  largo: 200,
  cotaMinima: 2970,
  cotaMaxima: 2995,
  terreno: [{ s: 0, cota: 2990 }, { s: 100, cota: 2985 }, { s: 200, cota: 2975 }],
  segmentos: [
    { tipo: 'tubo', id: 'T01', puntos: [{ s: 0, cota: 2988 }, { s: 90, cota: 2984 }] },
    { tipo: 'unidad', id: 'rafa', puntos: [{ s: 90, cota: 2984 }, { s: 110, cota: 2983 }] },
    { tipo: 'tubo', id: 'T09', puntos: [{ s: 110, cota: 2983 }, { s: 200, cota: 2972 }] },
  ],
  unidades: [
    { id: 'rafa', nombre: 'RAFA', desde: 90, hasta: 110, fondo: 2978, corona: 2985, demo: false },
    { id: 'camara', nombre: 'Cámara', desde: 150, hasta: 150.1, fondo: 2976, corona: 2979, demo: true },
  ],
  buzones: [{ id: 'BZ-1', s: 90, tapa: 2986, fondo: 2984, demo: false }, { id: 'BZ-2', s: 160, tapa: 2980, fondo: 2978, demo: true }],
  hayEjemplo: true,
  fuente: 'prueba',
}
const marco = { ancho: 500, alto: 200, izquierda: 50, derecha: 10, arriba: 10, abajo: 30 }
const g = geometriaPerfil(perfil, marco, 'rafa')

describe('geometría del perfil', () => {
  it('la progresiva 0 va en el borde izquierdo del gráfico y el largo total en el derecho; la cota máxima arriba y la mínima abajo', () => {
    expect(g.x(0)).toBeCloseTo(50, 6)
    expect(g.x(200)).toBeCloseTo(490, 6)
    expect(g.y(2995)).toBeCloseTo(10, 6)
    expect(g.y(2970)).toBeCloseTo(170, 6)
  })
  it('el terreno, cada tubería y cada paso por una unidad tienen su camino', () => {
    expect(g.terreno.startsWith('M')).toBe(true)
    expect(g.segmentos.map((s) => s.id)).toEqual(['T01', 'rafa', 'T09'])
    for (const s of g.segmentos) expect(s.d.startsWith('M')).toBe(true)
  })
  it('las unidades son barras de fondo a coronación, con un ancho mínimo para que se vean, y se marca la elegida', () => {
    const rafa = g.unidades.find((u) => u.id === 'rafa')!
    expect(rafa.elegida).toBe(true)
    expect(rafa.yArriba).toBeLessThan(rafa.yAbajo)
    expect(rafa.ancho).toBeCloseTo(g.x(110) - g.x(90), 6)
    const camara = g.unidades.find((u) => u.id === 'camara')!
    expect(camara.ancho).toBeGreaterThanOrEqual(MIN_ANCHO_UNIDAD_PERFIL)
    expect(camara.elegida).toBe(false)
  })
  it('los ejes traen marcas en números redondos dentro del gráfico', () => {
    expect(g.marcasX.map((m) => m.valor)).toEqual([0, 50, 100, 150, 200])
    expect(g.marcasY.every((m) => m.valor % 5 === 0 && m.valor >= 2970 && m.valor <= 2995)).toBe(true)
  })
  it('los buzones llevan su posición', () => {
    expect(g.buzones[0].x).toBeCloseTo(g.x(90), 6)
    expect(g.buzones[0].yTapa).toBeLessThan(g.buzones[0].yFondo)
    expect(g.buzones.map((b) => b.demo)).toEqual([false, true])
  })
})

describe('tabla alternativa del perfil', () => {
  it('lista cada unidad y cada buzón por progresiva, con su cota y "Dato de ejemplo" donde lo es', () => {
    const filas = filasTablaPerfil(perfil)
    expect(filas.map((f) => f.nombre)).toEqual(['RAFA', 'BZ-1', 'Cámara', 'BZ-2'])
    expect(filas.find((f) => f.nombre === 'BZ-2')!.ejemplo).toBe(true)
    expect(filas.find((f) => f.nombre === 'Cámara')!.ejemplo).toBe(true)
    expect(filas.find((f) => f.nombre === 'RAFA')!.ejemplo).toBe(false)
    expect(filas.find((f) => f.nombre === 'BZ-1')!.ejemplo).toBe(false) // el buzón toma su propio demo
    expect(filas.map((f) => f.s)).toEqual([...filas.map((f) => f.s)].sort((a, b) => a - b))
  })
})
