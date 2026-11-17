import { describe, expect, it } from 'vitest'
import type { Cuadricula } from './altura'
import { nivelarFuentes, type FuenteNivel } from './nivelacion'

// Terreno de 21 × 21 nodos cada 3 m (0 a 60 m), con 10 % de pendiente hacia el este: cota = 100 + 0.1 x.
const natural = (): Cuadricula => ({ x0: 0, y0: 0, paso: 3, columnas: 21, filas: 21, cotas: Array.from({ length: 441 }, (_, i) => 100 + 0.1 * 3 * (i % 21)) })
const x = (g: Cuadricula, c: number) => g.x0 + c * g.paso
const h = (g: Cuadricula, cx: number, cy: number) => g.cotas[(cy / g.paso) * g.columnas + cx / g.paso]

/** Plataforma cuadrada de 24 a 36 m (centro 30, 30), a la cota 100: la ladera natural ahí vale 103. */
const plataforma = (): FuenteNivel => ({
  id: 'edificio',
  caja: { xMin: -100, xMax: 200, yMin: -100, yMax: 200 },
  en: (px, py) => ({ distancia: Math.hypot(Math.max(24 - px, 0, px - 36), Math.max(24 - py, 0, py - 36)), cota: 100, libre: true }),
})
const opciones = { taludMaximo: 3, taludMinimo: 1, paso: 0.5, holgura: 3, umbral: 0.5 }
const lejos = () => 1000

describe('nivelarFuentes', () => {
  it('deja plana la plataforma, con talud 1:3 hacia afuera, y no toca lo lejano', () => {
    const { cuadricula: g, informe } = nivelarFuentes(natural(), [plataforma()], lejos, opciones)
    expect(informe[0].talud).toBe(3)
    expect(informe[0].reducido).toBe(false)
    expect(h(g, 30, 30)).toBeCloseTo(100, 9)
    expect(h(g, 27, 33)).toBeCloseTo(100, 9)
    for (let cy = 0; cy < 21; cy++) {
      for (let cx = 0; cx < 21; cx++) {
        const [px, py] = [x(g, cx), x(g, cy)]
        const d = plataforma().en(px, py).distancia
        const nat = natural().cotas[cy * 21 + cx]
        expect(Math.abs(g.cotas[cy * 21 + cx] - 100)).toBeLessThanOrEqual(Math.min(Math.abs(nat - 100), d / 3) + 1e-9)
      }
    }
    expect(h(g, 0, 0)).toBeCloseTo(100, 9) // 0.1 × 0 = 0 → cota natural 100
    expect(h(g, 60, 0)).toBeCloseTo(106, 9) // muy lejos: sin cambio
  })

  it('no modifica los nodos protegidos (distancia a lo hidráulico menor que el umbral)', () => {
    const protegida = (px: number, py: number) => Math.hypot(px - 30, py - 30)
    const { cuadricula: g } = nivelarFuentes(natural(), [plataforma()], protegida, opciones)
    expect(h(g, 30, 30)).toBeCloseTo(103, 9)
  })

  it('reduce el talud (sin mover nada) si el talud llegaría a menos de 3 m de lo hidráulico, y lo informa', () => {
    const protegida = (px: number, py: number) => Math.max(0, Math.hypot(px - 48, py - 30) - 2)
    const { cuadricula: g, informe } = nivelarFuentes(natural(), [plataforma()], protegida, opciones)
    expect(informe[0].reducido).toBe(true)
    expect(informe[0].talud).toBeLessThan(3)
    expect(informe[0].holgura).toBeGreaterThanOrEqual(3)
    expect(informe[0].cumple).toBe(true)
    expect(h(g, 45, 30)).toBeCloseTo(natural().cotas[(30 / 3) * 21 + 45 / 3], 9)
  })

  it('si ni con el talud mínimo hay 3 m de holgura, usa el mínimo y lo informa como "no cumple"', () => {
    const protegida = (px: number, py: number) => Math.max(0, Math.hypot(px - 40, py - 30) - 2)
    const { informe } = nivelarFuentes(natural(), [plataforma()], protegida, opciones)
    expect(informe[0].talud).toBe(1)
    expect(informe[0].cumple).toBe(false)
  })

  it('las fuentes "no libres" (tramo anclado) no cuentan para la holgura', () => {
    const anclada: FuenteNivel = { ...plataforma(), en: (px, py) => ({ ...plataforma().en(px, py), libre: false }) }
    const protegida = (px: number, py: number) => Math.max(0, Math.hypot(px - 40, py - 30) - 0)
    const { informe } = nivelarFuentes(natural(), [anclada], protegida, opciones)
    expect(informe[0].talud).toBe(3)
  })
})

describe('varias fuentes', () => {
  it('una fuente posterior no cambia la zona plana de una anterior', () => {
    // Una vía muy baja pegada a la plataforma: su talud no puede cortar el piso de la plataforma.
    const baja: FuenteNivel = { id: 'via', caja: { xMin: -100, xMax: 200, yMin: -100, yMax: 200 }, en: (px) => ({ distancia: Math.max(0, Math.abs(px - 42) - 1), cota: 90, libre: true }) }
    const { cuadricula: g } = nivelarFuentes(natural(), [plataforma(), baja], lejos, opciones)
    expect(h(g, 30, 30)).toBeCloseTo(100, 9)
    expect(h(g, 42, 30)).toBeCloseTo(90, 9)
  })
})
