import { describe, expect, it } from 'vitest'
import entornoCrudo from '../../../datos/entorno.json'
import { datos, tramo } from './ayudaPruebas'

type Punto = { x: number; y: number }
/** Punto más cercano de una polilínea a otro punto, y su distancia. */
function masCercano(p: Punto, linea: Punto[]): { distancia: number; punto: Punto } {
  let mejor = { distancia: Number.POSITIVE_INFINITY, punto: linea[0] }
  for (let i = 1; i < linea.length; i++) {
    const [a, b] = [linea[i - 1], linea[i]]
    const [dx, dy] = [b.x - a.x, b.y - a.y]
    const f = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)))
    const q = { x: a.x + dx * f, y: a.y + dy * f }
    const d = Math.hypot(p.x - q.x, p.y - q.y)
    if (d < mejor.distancia) mejor = { distancia: d, punto: q }
  }
  return mejor
}
const orillas = [...entornoCrudo.rio.margenesA, entornoCrudo.rio.margenB]
const cercana = (p: Punto) => orillas.map((o) => masCercano(p, o)).reduce((a, b) => (b.distancia < a.distancia ? b : a))

describe('efluente hasta el río (T16.5.3)', () => {
  const t = tramo('T21')
  const fin = t.trazado[t.trazado.length - 1]
  const corte = { x: 29.1, y: 6.4 } // donde el DXF corta la tubería
  it('su extremo toca la orilla del río (a menos de 10 cm)', () => {
    expect(cercana(fin).distancia).toBeLessThan(0.1)
  })
  it('es la prolongación en línea recta desde donde el DXF la corta hasta la orilla más cercana', () => {
    const anterior = t.trazado[t.trazado.length - 2]
    expect(anterior.x).toBeCloseTo(corte.x, 6)
    expect(anterior.y).toBeCloseTo(corte.y, 6)
    expect(Math.hypot(fin.x - corte.x, fin.y - corte.y)).toBeCloseTo(cercana(corte).distancia, 1)
  })
  it('el punto de descarga es ese extremo y el tramo nuevo está marcado POR CONFIRMAR', () => {
    const p = datos.puntos.find((x) => x.id === 'descarga-rio')!
    expect(p.x.valor).toBeCloseTo(fin.x, 6)
    expect(p.y.valor).toBeCloseTo(fin.y, 6)
    expect(t.fuenteTrazado).toContain('POR CONFIRMAR')
    expect(p.x.fuente).toContain('POR CONFIRMAR')
    expect(t.fuenteTrazado).toContain('.dxf')
  })
  it('el tramo sigue siendo efluente (rojo) y baja o se mantiene hasta el río', () => {
    expect(t.linea).toBe('efluente')
    expect(t.cotaLlegada.valor).toBeLessThanOrEqual(t.cotaSalida.valor)
  })
})
