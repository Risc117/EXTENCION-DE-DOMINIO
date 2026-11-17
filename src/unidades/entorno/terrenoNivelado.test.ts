import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/conexiones.json'
import { REDONDEO_COTA_PISO, ELEVACION_PAVIMENTO, ENTERRADO_BASE } from '../../nucleo/constantesEntorno'
import { TRANSICION_EXPLANADA, alturaEn } from '../../nucleo/terreno'
import { distanciaProtegida } from '../comun/protegido'
import { terrenoUnidades } from '../comun/terrenoPlanta'
import { planta } from '../planta'
import { entorno } from './datos'
import { bloqueEdificio, cotaPisoCorte, distanciaPoligono, losaPavimento, plataformasDe, poligonoCirculo } from './nivelacion'
import { terrenoNivelado, alturaNivelada } from './terrenoNivelado'

const antes = (x: number, y: number) => alturaEn(terrenoUnidades(1), x, y)!
const plataformas = plataformasDe(entorno)
const borde = entorno.nivelacion.borde.valor
const vias = entorno.nivelacion.vias

/** Distancia (m) de un punto a una polilínea. */
function distanciaPolilinea(x: number, y: number, linea: { x: number; y: number }[]): number {
  let minimo = Number.POSITIVE_INFINITY
  for (let i = 1; i < linea.length; i++) {
    const [a, b] = [linea[i - 1], linea[i]]
    const [dx, dy] = [b.x - a.x, b.y - a.y]
    const f = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy)))
    minimo = Math.min(minimo, Math.hypot(x - (a.x + dx * f), y - (a.y + dy * f)))
  }
  return minimo
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

describe('plataformas: edificios, estacionamiento y patio, rotonda (T16.8.3)', () => {
  it('hay una plataforma por edificio (la oficina y el almacén-taller comparten una) y una por pavimento (el estacionamiento y el patio comparten una)', () => {
    expect(plataformas.map((p) => p.id)).toEqual(['estacionamiento-patio', 'rotonda', 'garita', 'oficina-taller', 'laboratorio', 'grupo-electrogeno', 'almacen-emergencia'])
  })
  it('la cota de cada plataforma es de ejemplo', () => {
    for (const p of plataformas) expect(p.demo, p.id).toBe(true)
  })
  it('edificios: la cota es el mínimo del terreno bajo la planta (corte, sin relleno), redondeado hacia abajo', () => {
    for (const p of plataformas.filter((x) => x.tipo === 'edificio')) {
      const minimo = cotaPisoCorte(p.poligonos, antes)
      expect(p.cotaPiso, p.id).toBeCloseTo(minimo, 6)
      expect(p.cotaPiso % REDONDEO_COTA_PISO < 1e-6 || REDONDEO_COTA_PISO - (p.cotaPiso % REDONDEO_COTA_PISO) < 1e-6, p.id).toBe(true)
    }
  })
  it('pavimentos: la cota es la del perfil de la vía de acceso en el punto más cercano (para entrar desde la vía)', () => {
    const { vias: v } = terrenoNivelado(1)
    const acceso = { 'estacionamiento-patio': 'via-estacionamiento', rotonda: 'via-interna' } as const
    for (const p of plataformas.filter((x) => x.tipo === 'pavimento')) {
      const [cx, cy] = [p.poligonos.flat().reduce((s, q) => s + q.x, 0) / p.poligonos.flat().length, p.poligonos.flat().reduce((s, q) => s + q.y, 0) / p.poligonos.flat().length]
      expect(Math.abs(p.cotaPiso - v[acceso[p.id as keyof typeof acceso]].cota(cx, cy)), p.id).toBeLessThanOrEqual(REDONDEO_COTA_PISO)
    }
  })
  it('informe: primero las vías, luego los pavimentos y los edificios; ningún talud sale de lo permitido y lo que no cumple se declara', () => {
    const { informe } = terrenoNivelado(1)
    expect(informe.map((i) => i.id)).toEqual([...vias, ...plataformas.map((p) => p.id)])
    for (const i of informe) {
      expect(i.talud).toBeLessThanOrEqual(entorno.nivelacion.talud.valor)
      expect(i.talud).toBeGreaterThanOrEqual(entorno.nivelacion.taludMinimo.valor)
      expect(i.cumple, `${i.id} talud ${i.talud} holgura ${i.holgura}`).toBe(i.holgura >= entorno.nivelacion.holgura.valor)
    }
  })
  it('todo nodo de la planta de una plataforma y su borde, fuera de lo hidráulico y de lo ya nivelado por otra, queda exactamente a su cota', () => {
    const g = terrenoNivelado(1).cuadricula
    const lista = plataformas.filter((p) => p.id !== 'garita')
    lista.forEach((p, k) => {
      let revisados = 0
      for (let f = 0; f < g.filas; f++) {
        for (let c = 0; c < g.columnas; c++) {
          const [x, y] = [g.x0 + c * g.paso, g.y0 + f * g.paso]
          const dentro = (q: { poligonos: typeof p.poligonos }) => q.poligonos.some((poligono) => distanciaPoligono(x, y, poligono) <= borde)
          // Donde el borde de una plataforma anterior (o una vía) se encima, manda la anterior.
          const enVia = vias.some((id) => {
            const v = entorno.vias.find((q) => q.id === id)!
            return distanciaPolilinea(x, y, v.eje) <= v.ancho.valor / 2 + borde
          })
          if (!dentro(p) || distanciaProtegida(x, y) < g.paso * Math.SQRT2 || lista.slice(0, k).some(dentro) || enVia) continue
          revisados++
          expect(g.cotas[f * g.columnas + c], `${p.id} ${x},${y}`).toBeCloseTo(p.cotaPiso, 9)
        }
      }
      // La rotonda es el final de la vía interna: su zona plana ya la fija la vía (a su misma cota), así que no queda ningún nodo propio por revisar.
      if (p.id !== 'rotonda') expect(revisados, p.id).toBeGreaterThan(0)
    })
  })
  it('la rotonda queda a la cota de su plataforma, que es la del final de la vía interna (±0.1 m)', () => {
    const r = entorno.rotondas[0]
    expect(Math.abs(alturaNivelada(r.centro.x, r.centro.y) - r.cotaPiso.valor)).toBeLessThanOrEqual(0.1)
  })
  it('un pavimento no tiene paredes: su alto es su espesor más un centímetro y su cara de arriba queda a ras (a la cota)', () => {
    for (const s of [...entorno.superficies, ...entorno.rotondas]) {
      const cota = s.cotaPiso.valor
      const l = losaPavimento(cota, s.espesor.valor)
      expect(l.alto).toBeCloseTo(s.espesor.valor + ELEVACION_PAVIMENTO, 9)
      expect(l.base + l.alto).toBeCloseTo(cota + ELEVACION_PAVIMENTO, 9)
      expect(l.alto).toBeLessThan(0.3)
    }
  })
  it('un edificio arranca en su piso: solo una cimentación enterrada, sin paredes de relleno', () => {
    const b = bloqueEdificio(2990, 3.2)
    expect(b.base).toBeCloseTo(2990 - ENTERRADO_BASE, 9)
    expect(b.base + b.alto).toBeCloseTo(2993.2, 9)
  })
  it('el círculo de la rotonda es un polígono de ese radio', () => {
    const c = poligonoCirculo({ x: 12, y: 28 }, 5, 32)
    expect(c).toHaveLength(32)
    for (const p of c) expect(Math.hypot(p.x - 12, p.y - 28)).toBeCloseTo(5, 9)
  })
})

describe('vías interna y de acceso: solo cambian de altura', () => {
  const rafa = planta.unidades.find((u) => u.id === 'rafa')!
  const distRafa = (p: { x: number; y: number }) => Math.hypot(p.x - rafa.x.valor, p.y - rafa.y.valor)
  const via = (id: string) => entorno.vias.find((v) => v.id === id)!

  it('el perfil de cada vía respeta la pendiente máxima en todo tramo que no una dos estaciones ancladas', () => {
    for (const id of vias) {
      const v = terrenoNivelado(1).vias[id]
      expect(v.cumple, id).toBe(true)
      let maximo = 0
      v.estaciones.slice(1).forEach((p, i) => {
        if (p.anclada && v.estaciones[i].anclada) return
        maximo = Math.max(maximo, Math.abs(p.cota - v.estaciones[i].cota) / 1.5)
      })
      expect(maximo, id).toBeLessThanOrEqual(entorno.nivelacion.pendienteMaxima.valor + 0.005)
    }
  })
  it('la vía de acceso parte de la cota de la vía interna en el cruce del portón (sin escalón)', () => {
    const t = terrenoNivelado(1)
    const inicio = via('via-estacionamiento').eje[0]
    expect(t.vias['via-estacionamiento'].estaciones[0].cota).toBeCloseTo(t.vias['via-interna'].cota(inicio.x, inicio.y), 2)
  })
  it('en el piso plano del RAFA (radio de 10 m) la vía interna queda a la cota del terreno sin modificar', () => {
    const dentro = terrenoNivelado(1).vias['via-interna'].estaciones.filter((p) => distRafa(p) <= rafa.radioExplanada.valor)
    for (const p of dentro) {
      expect(p.anclada).toBe(true)
      expect(p.cota, `${p.x},${p.y}`).toBeCloseTo(antes(p.x, p.y), 6)
    }
  })
  it('en la transición del RAFA (10 a 18 m) la vía se suaviza, salvo donde toca una tubería o un buzón', () => {
    const r = rafa.radioExplanada.valor
    const transicion = terrenoNivelado(1).vias['via-interna'].estaciones.filter((p) => distRafa(p) > r && distRafa(p) <= r + TRANSICION_EXPLANADA)
    expect(transicion.length).toBeGreaterThan(5)
    for (const p of transicion) expect(p.anclada, `${p.x},${p.y}`).toBe(distanciaProtegida(p.x, p.y) < via('via-interna').ancho.valor / 2)
    expect(transicion.some((p) => !p.anclada && Math.abs(p.cota - antes(p.x, p.y)) > 0.05)).toBe(true)
  })
  it('el trazado en planta no cambia: los ejes siguen siendo los del DXF (PTAR-EJE)', () => {
    expect(via('via-interna').eje[0]).toEqual({ x: 1.7, y: -80.3 })
    expect(via('via-interna').eje[via('via-interna').eje.length - 1]).toEqual({ x: 12, y: 28 })
    expect(via('via-estacionamiento').eje[0]).toEqual({ x: -8.5, y: -79 })
    for (const id of vias) expect(via(id).fuenteEje).toContain('PTAR-EJE')
  })
})
