import { describe, expect, it } from 'vitest'
import { DESFASE_VIA_SOBRE_TERRENO, ELEVACION_VIA, PASO_PERFIL_VIA } from '../../nucleo/constantesEntorno'
import { entorno } from './datos'
import { terrenoNivelado, alturaNivelada } from './terrenoNivelado'

const t = terrenoNivelado(1)
const vias = entorno.nivelacion.vias
const via = (id: string) => entorno.vias.find((v) => v.id === id)!

/** Puntos de la cinta de una vía: el eje y sus dos bordes, en cada estación. */
function puntosDeCinta(id: string) {
  const e = t.vias[id].estaciones
  const ancho = via(id).ancho.valor
  return e.flatMap((p, i) => {
    const [a, b] = [e[Math.max(i - 1, 0)], e[Math.min(i + 1, e.length - 1)]]
    const l = Math.hypot(b.x - a.x, b.y - a.y) || 1
    const [nx, ny] = [-(b.y - a.y) / l, (b.x - a.x) / l]
    return [0, 1, -1].map((lado) => ({ x: p.x + nx * lado * (ancho / 2), y: p.y + ny * lado * (ancho / 2), estacion: i, lado }))
  })
}

describe('la cinta de la vía nunca queda bajo el terreno (T16.8.4)', () => {
  it('en todas las estaciones y en sus dos bordes, la cinta (con su elevación) está a la cota del terreno o por encima', () => {
    for (const id of vias) {
      for (const p of puntosDeCinta(id)) {
        const cinta = t.vias[id].cinta(p.x, p.y) + ELEVACION_VIA
        expect(cinta, `${id} estación ${p.estacion} lado ${p.lado}`).toBeGreaterThanOrEqual(alturaNivelada(p.x, p.y))
      }
    }
  })
  it('donde el terreno no se pudo modificar, la cinta sigue al terreno con un pequeño desfase hacia arriba', () => {
    let revisadas = 0
    for (const id of vias) {
      for (const p of puntosDeCinta(id)) {
        const [terreno, perfil] = [alturaNivelada(p.x, p.y), t.vias[id].cota(p.x, p.y)]
        if (terreno + DESFASE_VIA_SOBRE_TERRENO <= perfil) continue
        revisadas++
        expect(t.vias[id].cinta(p.x, p.y)).toBeCloseTo(terreno + DESFASE_VIA_SOBRE_TERRENO, 9)
      }
    }
    expect(revisadas).toBeGreaterThan(0)
  })
})

describe('el terreno se lleva a la cota de la vía a lo largo de todo el corredor (T16.8.4)', () => {
  it('toda estación que no es un tramo sin nivelar queda a la cota del perfil (±5 cm): corte donde sobra y relleno donde falta', () => {
    for (const id of vias) {
      const sin = t.vias[id].sinNivelar
      t.vias[id].estaciones.forEach((e, i) => {
        if (sin.some((tr) => i >= tr.desde && i <= tr.hasta)) return
        expect(Math.abs(alturaNivelada(e.x, e.y) - e.cota), `${id} estación ${i}`).toBeLessThanOrEqual(0.05)
      })
    }
  })
  it('los tramos sin nivelar existen, son pocos y cada uno tiene su causa (nada queda sin explicar)', () => {
    for (const id of vias) {
      const sin = t.vias[id].sinNivelar
      const estaciones = t.vias[id].estaciones.length
      const cuantas = sin.reduce((s, tr) => s + (tr.hasta - tr.desde + 1), 0)
      expect(cuantas / estaciones, id).toBeLessThan(0.5)
      for (const tr of sin) {
        expect(tr.causa, `${id} ${tr.desde}-${tr.hasta}`).not.toBe('sin explicar')
        expect(tr.diferenciaMaxima).toBeGreaterThan(0.05)
        expect(tr.hasta).toBeGreaterThanOrEqual(tr.desde)
      }
    }
    expect(vias.reduce((s, id) => s + t.vias[id].sinNivelar.length, 0)).toBeGreaterThan(0)
  })
  it('las estaciones están separadas el paso del perfil', () => {
    const e = t.vias[vias[0]].estaciones
    expect(Math.hypot(e[1].x - e[0].x, e[1].y - e[0].y)).toBeLessThanOrEqual(PASO_PERFIL_VIA + 1e-9)
  })
})
