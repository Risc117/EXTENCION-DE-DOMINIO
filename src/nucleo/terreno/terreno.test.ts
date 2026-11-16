import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { alturaEn, cuadricula } from './altura'
import { esquemaTerreno, terrenoEsDemo } from './esquema'
import { avisoDemoTerreno, textoCotaTerreno } from './formato'

const crudo = JSON.parse(readFileSync('datos/terreno.json', 'utf8'))
const terreno = esquemaTerreno.parse(crudo)
const total = cuadricula(terreno)

/** Distancia de un punto a un segmento. */
function distanciaSegmento(x: number, y: number, a: number[], b: number[]): number {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]]
  const l2 = dx * dx + dy * dy
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2))
  return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy)
}

describe('datos/terreno.json', () => {
  it('es válido, tiene fuente y origen UTM', () => {
    expect(terreno.fuente).toContain('.dxf')
    expect(terreno.malla.fuente).toContain('.dxf')
    expect(terreno.origenUtm.zona).toBe('18 sur')
    expect(terreno.curvas.length).toBeGreaterThan(100)
  })

  it('el muro lleva fuente y su altura es dato de ejemplo', () => {
    expect(terreno.muro.trazo.length).toBeGreaterThanOrEqual(3)
    expect(terreno.muro.altura.demo).toBe(true)
    expect(terrenoEsDemo(terreno)).toBe(true)
  })

  it('la cota bajo un punto de una curva coincide con la curva (±0.5 m en casi todos los puntos)', () => {
    let revisados = 0
    let fuera = 0
    for (const c of terreno.curvas) {
      for (let i = 1; i < c.puntos.length; i += 3) {
        const [a, b] = [c.puntos[i - 1], c.puntos[i]]
        const h = alturaEn(total, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
        if (h === null) continue
        revisados++
        if (Math.abs(h - c.cota) > 0.5) fuera++
      }
    }
    expect(revisados).toBeGreaterThan(1000)
    expect(fuera / revisados).toBeLessThan(0.03)
  })

  it('en un punto cualquiera la cota coincide con la curva más cercana (±0.5 m si está a menos de 1 m de ella)', () => {
    const m = terreno.malla
    let revisados = 0
    let fuera = 0
    for (let k = 0; k < 3000; k++) {
      const x = m.x0 + (((k * 7919) % 10007) / 10007) * (m.columnas - 1) * m.paso
      const y = m.y0 + (((k * 104729) % 10009) / 10009) * (m.filas - 1) * m.paso
      let mejor = Infinity
      let cota = 0
      for (const c of terreno.curvas) {
        for (let i = 1; i < c.puntos.length; i++) {
          const d = distanciaSegmento(x, y, c.puntos[i - 1], c.puntos[i])
          if (d < mejor) [mejor, cota] = [d, c.cota]
        }
      }
      const h = alturaEn(total, x, y)
      if (mejor > 1 || h === null) continue
      revisados++
      if (Math.abs(h - cota) > 0.5) fuera++
    }
    expect(revisados).toBeGreaterThan(500)
    expect(fuera / revisados).toBeLessThan(0.05)
  })

  it('la malla gruesa de calidad baja cubre la misma zona con menos nodos', () => {
    const gruesa = cuadricula(terreno, 2)
    expect(gruesa.cotas.length).toBeLessThan(total.cotas.length / 3)
    expect(gruesa.paso).toBe(total.paso * 2)
  })
})

describe('esquema del terreno', () => {
  it('rechaza una malla con la cantidad de alturas equivocada', () => {
    const mala = { ...crudo, malla: { ...crudo.malla, alturas: [1, 2, 3] } }
    expect(esquemaTerreno.safeParse(mala).success).toBe(false)
  })

  it('rechaza datos sin fuente', () => {
    const mala = { ...crudo, muro: { ...crudo.muro, altura: { valor: 2, unidad: 'm' } } }
    expect(esquemaTerreno.safeParse(mala).success).toBe(false)
  })
})

describe('alturaEn', () => {
  const g = { x0: 0, y0: 0, paso: 10, columnas: 2, filas: 2, cotas: [100, 110, 120, 130] }
  it('interpola entre nodos', () => {
    expect(alturaEn(g, 0, 0)).toBe(100)
    expect(alturaEn(g, 5, 0)).toBe(105)
    expect(alturaEn(g, 5, 5)).toBe(115)
  })
  it('devuelve null fuera de la malla', () => {
    expect(alturaEn(g, -1, 0)).toBeNull()
    expect(alturaEn(g, 5, 11)).toBeNull()
  })
})

describe('textos del terreno', () => {
  it('la cota se muestra con 1 decimal y su unidad', () => {
    expect(textoCotaTerreno(2977.1234)).toBe('2977.1 m s.n.m.')
  })
  it('avisa "Dato de ejemplo" mientras la altura del muro sea de ejemplo', () => {
    expect(avisoDemoTerreno(terreno)).toBe('Dato de ejemplo: altura del muro')
  })
  it('no avisa si el muro viene del plano', () => {
    const real = { ...terreno, muro: { ...terreno.muro, altura: { ...terreno.muro.altura, demo: false } } }
    expect(avisoDemoTerreno(real)).toBeNull()
  })
})
