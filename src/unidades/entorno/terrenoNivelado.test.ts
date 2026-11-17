import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/conexiones.json'
import { TRANSICION_EXPLANADA, alturaEn } from '../../nucleo/terreno'
import { distanciaProtegida } from '../comun/protegido'
import { terrenoUnidades } from '../comun/terrenoPlanta'
import { planta } from '../planta'
import { entorno } from './datos'
import { cotaPisoDerivada, distanciaPoligono } from './nivelacion'
import { terrenoNivelado, alturaNivelada } from './terrenoNivelado'

const antes = (x: number, y: number) => alturaEn(terrenoUnidades(1), x, y)!
/** Plataformas: los edificios con el mismo `plataforma` comparten una; el resto tiene la suya (T16.8.2). */
const idPlataforma = (e: (typeof entorno.edificios)[number]) => e.plataforma ?? e.id
const plataformas = () => {
  const m = new Map<string, typeof entorno.edificios>()
  for (const e of entorno.edificios) m.set(idPlataforma(e), [...(m.get(idPlataforma(e)) ?? []), e])
  return [...m.entries()].map(([id, edificios]) => ({ id, edificios, poligonos: edificios.map((e) => e.poligono) }))
}

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
  it('la oficina y el almacén-taller comparten una sola plataforma, con una sola cota de ejemplo', () => {
    const [of, ta] = ['oficina', 'almacen-taller'].map((id) => entorno.edificios.find((e) => e.id === id)!)
    expect(of.plataforma).toBeDefined()
    expect(ta.plataforma).toBe(of.plataforma)
    expect(ta.cotaPiso.valor).toBe(of.cotaPiso.valor)
    expect(of.cotaPiso.demo).toBe(true)
    expect(ta.cotaPiso.demo).toBe(true)
  })
  it('la cota de piso del JSON es el promedio del terreno bajo la planta de su plataforma (±0.05 m) y es de ejemplo', () => {
    for (const p of plataformas()) {
      for (const e of p.edificios) {
        expect(e.cotaPiso.demo, e.id).toBe(true)
        expect(Math.abs(e.cotaPiso.valor - cotaPisoDerivada(p.poligonos, antes)), e.id).toBeLessThanOrEqual(0.051)
      }
    }
  })
  it('cada edificio queda plano a su cota de piso, salvo donde ya hay una unidad (la garita está en la explanada de EB-1)', () => {
    for (const e of entorno.edificios.filter((x) => x.id !== 'garita')) {
      const [xs, ys] = [e.poligono.map((p) => p.x), e.poligono.map((p) => p.y)]
      const centro = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]
      expect(Math.abs(alturaNivelada(centro[0], centro[1]) - e.cotaPiso.valor), e.id).toBeLessThanOrEqual(0.1)
    }
  })
  it('informe: una entrada por plataforma y la vía; ningún talud sale de lo permitido y lo que no cumple se declara', () => {
    const { informe } = terrenoNivelado(1)
    expect(informe.map((i) => i.id)).toEqual([...plataformas().map((p) => p.id), entorno.nivelacion.via])
    for (const i of informe) {
      expect(i.talud).toBeLessThanOrEqual(entorno.nivelacion.talud.valor)
      expect(i.talud).toBeGreaterThanOrEqual(entorno.nivelacion.taludMinimo.valor)
      expect(i.cumple, `${i.id} talud ${i.talud} holgura ${i.holgura}`).toBe(i.holgura >= entorno.nivelacion.holgura.valor)
    }
  })
  it('todo nodo de la planta de una plataforma y su borde, fuera de lo hidráulico, queda exactamente a su cota (también el hueco entre la oficina y el almacén-taller)', () => {
    const g = terrenoNivelado(1).cuadricula
    const borde = entorno.nivelacion.borde.valor
    const lista = plataformas().filter((p) => p.id !== 'garita')
    lista.forEach((p, k) => {
      let revisados = 0
      for (let f = 0; f < g.filas; f++) {
        for (let c = 0; c < g.columnas; c++) {
          const [x, y] = [g.x0 + c * g.paso, g.y0 + f * g.paso]
          const dentro = (q: { poligonos: (typeof p.poligonos) }) => q.poligonos.some((poligono) => distanciaPoligono(x, y, poligono) <= borde)
          // Donde el borde de una plataforma anterior se encima, manda la anterior.
          if (!dentro(p) || distanciaProtegida(x, y) < g.paso * Math.SQRT2 || lista.slice(0, k).some(dentro)) continue
          revisados++
          expect(g.cotas[f * g.columnas + c], `${p.id} ${x},${y}`).toBeCloseTo(p.edificios[0].cotaPiso.valor, 9)
        }
      }
      expect(revisados, p.id).toBeGreaterThan(3)
    })
    // El hueco de 2 m entre la oficina (y ≤ −80) y el almacén-taller (y ≥ −78) queda plano: (−20, −79) está en el hueco, fuera de ambas plantas.
    const [of, ta] = ['oficina', 'almacen-taller'].map((id) => entorno.edificios.find((e) => e.id === id)!)
    expect(distanciaPoligono(-20, -79, of.poligono)).toBeGreaterThan(0)
    expect(distanciaPoligono(-20, -79, ta.poligono)).toBeGreaterThan(0)
    expect(Math.abs(alturaNivelada(-20, -79) - of.cotaPiso.valor)).toBeLessThanOrEqual(0.1)
  })
})

describe('vía interna: solo cambia de altura', () => {
  const via = entorno.vias.find((v) => v.id === entorno.nivelacion.via)!
  const rafa = planta.unidades.find((u) => u.id === 'rafa')!
  const distRafa = (p: { x: number; y: number }) => Math.hypot(p.x - rafa.x.valor, p.y - rafa.y.valor)
  const estaciones = () => terrenoNivelado(1).viaEstaciones

  it('el perfil respeta la pendiente máxima en todo tramo que no una dos estaciones ancladas', () => {
    expect(terrenoNivelado(1).viaCumple).toBe(true)
    const e = estaciones()
    let maximo = 0
    e.slice(1).forEach((p, i) => {
      if (p.anclada && e[i].anclada) return
      maximo = Math.max(maximo, Math.abs(p.cota - e[i].cota) / 1.5)
    })
    expect(maximo).toBeLessThanOrEqual(entorno.nivelacion.pendienteMaxima.valor + 0.005)
  })
  it('en el piso plano del RAFA (radio de 10 m) la vía queda a la cota del terreno sin modificar', () => {
    const dentro = estaciones().filter((p) => distRafa(p) <= rafa.radioExplanada.valor)
    for (const p of dentro) {
      expect(p.anclada).toBe(true)
      expect(p.cota, `${p.x},${p.y}`).toBeCloseTo(antes(p.x, p.y), 6)
    }
  })
  it('en la transición del RAFA (10 a 18 m) la vía se suaviza, salvo donde toca una tubería o un buzón', () => {
    const r = rafa.radioExplanada.valor
    const transicion = estaciones().filter((p) => distRafa(p) > r && distRafa(p) <= r + TRANSICION_EXPLANADA)
    expect(transicion.length).toBeGreaterThan(5)
    for (const p of transicion) {
      const toca = distanciaProtegida(p.x, p.y) < via.ancho.valor / 2
      expect(p.anclada, `${p.x},${p.y}`).toBe(toca)
    }
    // y alguna sí se suavizó: su cota difiere de la del terreno
    expect(transicion.some((p) => !p.anclada && Math.abs(p.cota - antes(p.x, p.y)) > 0.05)).toBe(true)
  })
  it('el trazado en planta no cambia: el eje sigue siendo el del DXF (PTAR-EJE)', () => {
    expect(via.eje[0]).toEqual({ x: 1.7, y: -80.3 })
    expect(via.eje[via.eje.length - 1]).toEqual({ x: 12, y: 28 })
    expect(via.fuenteEje).toContain('PTAR-EJE')
  })
})
