import { describe, expect, it } from 'vitest'
import { entorno } from '../entorno/datos'
import { rutas } from './datos'
import { desplazar, distanciaAlo, entrePuntos, puntoEnPoligono, type Punto } from './geometria'
import { paradasDe, rutaDeTecnico, rutaDeVehiculo } from './rutas'

/** Puntos de la ruta cada `paso` metros (para revisar que no atraviesa nada entre vértices). */
function densificar(r: Punto[], paso = 0.5): Punto[] {
  const out: Punto[] = []
  for (let i = 1; i < r.length; i++) {
    const n = Math.max(1, Math.ceil(Math.hypot(r[i].x - r[i - 1].x, r[i].y - r[i - 1].y) / paso))
    for (let k = 0; k < n; k++) out.push({ x: r[i - 1].x + ((r[i].x - r[i - 1].x) * k) / n, y: r[i - 1].y + ((r[i].y - r[i - 1].y) * k) / n })
  }
  return out
}
const edificios = entorno.edificios.map((e) => e.poligono)
const dentroCerco = (p: Punto) => entorno.cerco.trazos.some((t) => puntoEnPoligono(p, t))

describe('geometría de rutas', () => {
  it('desplazar mueve la ruta de lado la distancia pedida', () => {
    const r = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }]
    for (const p of desplazar(r, 3)) expect(p.y).toBeCloseTo(3, 9)
    for (const p of desplazar(r, -3)) expect(p.y).toBeCloseTo(-3, 9)
  })
  it('distancia a lo largo de la ruta del punto más cercano', () => {
    const r = [{ x: 0, y: 0 }, { x: 10, y: 0 }]
    expect(distanciaAlo(r, { x: 4, y: 7 })).toBeCloseTo(4, 9)
    expect(distanciaAlo(r, { x: -5, y: 1 })).toBeCloseTo(0, 9)
  })
  it('entrePuntos junta tramos sin repetir el punto de unión', () => {
    expect(entrePuntos([[{ x: 0, y: 0 }, { x: 1, y: 0 }], [{ x: 1, y: 0 }, { x: 2, y: 0 }]])).toHaveLength(3)
  })
  it('punto en polígono', () => {
    const c = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }]
    expect(puntoEnPoligono({ x: 2, y: 2 }, c)).toBe(true)
    expect(puntoEnPoligono({ x: 5, y: 2 }, c)).toBe(false)
  })
})

describe('rutas de los datos reales', () => {
  it('el vigilante queda fuera de los edificios y dentro del cerco', () => {
    const v = rutas.vigilante.posicion
    for (const e of edificios) expect(puntoEnPoligono(v, e)).toBe(false)
    expect(dentroCerco(v)).toBe(true)
  })
  it('las rutas de los vehículos empiezan en el portón y terminan en el patio de maniobras', () => {
    const porton = entorno.cerco.portones[0]
    const medio = { x: (porton.desde.x + porton.hasta.x) / 2, y: (porton.desde.y + porton.hasta.y) / 2 }
    const patio = entorno.superficies.find((s) => s.id === 'patio')!.poligono
    for (const v of rutas.vehiculos) {
      const r = rutaDeVehiculo(v)
      expect(Math.hypot(r[0].x - medio.x, r[0].y - medio.y)).toBeLessThan(3)
      expect(puntoEnPoligono(r[r.length - 1], patio)).toBe(true)
    }
  })
  it('ningún punto de las rutas cae dentro de un edificio y todos están dentro del cerco', () => {
    const todas = [...rutas.vehiculos.map((v) => rutaDeVehiculo(v)), ...rutas.tecnicos.flatMap((t) => [1, -1].map((lado) => rutaDeTecnico(t, lado)))]
    for (const r of todas) {
      const puntos = densificar(r)
      for (const p of puntos) for (const e of edificios) expect(puntoEnPoligono(p, e), `(${p.x.toFixed(1)}, ${p.y.toFixed(1)}) dentro de un edificio`).toBe(false)
      expect(puntos.filter((p) => !dentroCerco(p)), 'puntos fuera del cerco').toEqual([])
    }
  })
  it('cada parada de un técnico queda en la estructura más cercana a su ruta (a menos de 25 m)', () => {
    for (const t of rutas.tecnicos) {
      const paradas = paradasDe(t, rutaDeTecnico(t, 1))
      expect(paradas).toHaveLength(t.paradas.length)
      for (const p of paradas) {
        expect(p.d).toBeGreaterThan(0)
        expect(p.pausa).toBeGreaterThan(0)
        expect(p.distanciaALaEstructura).toBeLessThan(25)
      }
    }
  })
  it('una parada con una estructura que no existe falla con un mensaje claro', () => {
    const t = { ...rutas.tecnicos[0], paradas: [{ unidad: 'no-existe', pausa: rutas.tecnicos[0].paradas[0].pausa }] }
    expect(() => paradasDe(t, rutaDeTecnico(rutas.tecnicos[0], 1))).toThrow(/no-existe/)
  })
})
