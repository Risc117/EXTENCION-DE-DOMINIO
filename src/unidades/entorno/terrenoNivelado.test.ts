import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/conexiones.json'
import { alturaEn } from '../../nucleo/terreno'
import { distanciaProtegida } from '../comun/protegido'
import { terrenoUnidades } from '../comun/terrenoPlanta'
import { planta } from '../planta'
import { entorno } from './datos'
import { cotaPisoDerivada, distanciaPoligono } from './nivelacion'
import { terrenoNivelado, alturaNivelada } from './terrenoNivelado'

const antes = (x: number, y: number) => alturaEn(terrenoUnidades(1), x, y)!

describe('el terreno en los puntos hidráulicos queda IGUAL (T16.8)', () => {
  it('en el centro de cada unidad', () => {
    for (const u of planta.unidades) expect(alturaNivelada(u.x.valor, u.y.valor), u.id).toBeCloseTo(antes(u.x.valor, u.y.valor), 9)
  })
  it('en cada vértice de cada tubería y en cada buzón', () => {
    for (const t of crudo.tramos) for (const p of t.trazado) expect(alturaNivelada(p.x, p.y), `${t.id} ${p.x},${p.y}`).toBeCloseTo(antes(p.x, p.y), 9)
    for (const p of crudo.puntos) expect(alturaNivelada(p.x.valor, p.y.valor), p.id).toBeCloseTo(antes(p.x.valor, p.y.valor), 9)
  })
  it('en todo nodo a menos de 0.5 m de lo hidráulico (la máscara)', () => {
    const [a, b] = [terrenoUnidades(1), terrenoNivelado(1).cuadricula]
    let revisados = 0
    for (let f = 0; f < a.filas; f++) {
      for (let c = 0; c < a.columnas; c++) {
        const [x, y] = [a.x0 + c * a.paso, a.y0 + f * a.paso]
        if (distanciaProtegida(x, y) >= 0.5) continue
        revisados++
        expect(b.cotas[f * a.columnas + c]).toBe(a.cotas[f * a.columnas + c])
      }
    }
    expect(revisados).toBeGreaterThan(50)
  })
})

describe('plataformas de los edificios', () => {
  it('la cota de piso del JSON es el promedio del terreno bajo la planta (±0.05 m) y es de ejemplo', () => {
    for (const e of entorno.edificios) {
      expect(e.cotaPiso.demo, e.id).toBe(true)
      expect(Math.abs(e.cotaPiso.valor - cotaPisoDerivada(e.poligono, antes)), e.id).toBeLessThanOrEqual(0.051)
    }
  })
  it('cada edificio queda plano a su cota de piso, salvo donde ya hay una unidad (la garita está en la explanada de EB-1)', () => {
    for (const e of entorno.edificios.filter((x) => x.id !== 'garita')) {
      const [xs, ys] = [e.poligono.map((p) => p.x), e.poligono.map((p) => p.y)]
      const centro = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]
      expect(Math.abs(alturaNivelada(centro[0], centro[1]) - e.cotaPiso.valor), e.id).toBeLessThanOrEqual(0.1)
    }
  })
  it('informe: ningún talud es más suave que el máximo ni más empinado que el mínimo, y lo que no cumple se declara', () => {
    const { informe } = terrenoNivelado(1)
    expect(informe.map((i) => i.id)).toEqual([...entorno.edificios.map((e) => e.id), 'via-interna'])
    for (const i of informe) {
      expect(i.talud).toBeLessThanOrEqual(entorno.nivelacion.talud.valor)
      expect(i.talud).toBeGreaterThanOrEqual(entorno.nivelacion.taludMinimo.valor)
      expect(i.cumple, `${i.id} talud ${i.talud} holgura ${i.holgura}`).toBe(i.holgura >= entorno.nivelacion.holgura.valor)
    }
  })
})

describe('vía interna: solo cambia de altura', () => {
  const via = entorno.vias.find((v) => v.id === 'via-interna')!
  const estaciones = () => {
    const pts: { x: number; y: number }[] = []
    for (let i = 1; i < via.eje.length; i++) {
      const [a, b] = [via.eje[i - 1], via.eje[i]]
      const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 1.5)
      for (let k = i === 1 ? 0 : 1; k <= n; k++) pts.push({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n })
    }
    return pts
  }
  it('el perfil respeta la pendiente máxima en todo tramo que no sea el anclado por el RAFA', () => {
    const { alturaVia, viaCumple } = terrenoNivelado(1)
    expect(viaCumple).toBe(true)
    const pts = estaciones()
    const rafa = planta.unidades.find((u) => u.id === 'rafa')!
    const enRafa = (p: { x: number; y: number }) => Math.hypot(p.x - rafa.x.valor, p.y - rafa.y.valor) <= rafa.radioExplanada.valor + 8
    let maxLibre = 0
    pts.slice(1).forEach((p, i) => {
      if (enRafa(p) && enRafa(pts[i])) return
      maxLibre = Math.max(maxLibre, Math.abs(alturaVia(p.x, p.y) - alturaVia(pts[i].x, pts[i].y)) / 1.5)
    })
    expect(maxLibre).toBeLessThanOrEqual(entorno.nivelacion.pendienteMaxima.valor + 0.005)
  })
  it('donde la vía cruza la explanada del RAFA (radio y transición) queda a la cota del terreno sin modificar', () => {
    const rafa = planta.unidades.find((u) => u.id === 'rafa')!
    const dentro = estaciones().filter((p) => Math.hypot(p.x - rafa.x.valor, p.y - rafa.y.valor) <= rafa.radioExplanada.valor + 8)
    expect(dentro.length).toBeGreaterThan(5)
    for (const p of dentro) expect(terrenoNivelado(1).alturaVia(p.x, p.y), `${p.x},${p.y}`).toBeCloseTo(antes(p.x, p.y), 6)
  })
  it('el trazado en planta no cambia: el eje sigue siendo el del DXF (PTAR-EJE)', () => {
    expect(via.eje[0]).toEqual({ x: 1.7, y: -80.3 })
    expect(via.eje[via.eje.length - 1]).toEqual({ x: 12, y: 28 })
    expect(via.fuenteEje).toContain('PTAR-EJE')
  })
})

describe('plataformas planas (T16.8.1)', () => {
  it('todo nodo de la planta de un edificio y su borde, fuera de lo hidráulico, queda exactamente a su cota de piso', () => {
    const g = terrenoNivelado(1).cuadricula
    for (const e of entorno.edificios.filter((x) => x.id !== 'garita')) {
      let revisados = 0
      for (let f = 0; f < g.filas; f++) {
        for (let c = 0; c < g.columnas; c++) {
          const [x, y] = [g.x0 + c * g.paso, g.y0 + f * g.paso]
          const borde = entorno.nivelacion.borde.valor
          // Donde el borde de otro edificio se encima (la oficina y el almacén-taller están a 2 m), manda el primero de la lista.
          const otros = entorno.edificios.filter((o) => o.id !== e.id && entorno.edificios.indexOf(o) < entorno.edificios.indexOf(e))
          if (distanciaPoligono(x, y, e.poligono) > borde || distanciaProtegida(x, y) < g.paso * Math.SQRT2 || otros.some((o) => distanciaPoligono(x, y, o.poligono) <= borde)) continue
          revisados++
          expect(g.cotas[f * g.columnas + c], `${e.id} ${x},${y}`).toBeCloseTo(e.cotaPiso.valor, 9)
        }
      }
      expect(revisados, e.id).toBeGreaterThan(3)
    }
  })
})
