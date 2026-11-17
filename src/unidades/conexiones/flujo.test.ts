import { describe, expect, it } from 'vitest'
import { esquemaConexiones } from './esquema'
import { clon, datos, referencia } from './ayudaPruebas'
import { construirTramos } from './geometria'
import { cantidadPerlas, construirRutas, puntoEnRuta, velocidadTramo } from './flujo'

describe('campo `caudal` de cada tramo', () => {
  it('todos los tramos lo traen y es uno de los conocidos', () => {
    for (const t of datos.tramos) expect(['entrada', 'salida', 'mitad', 'lodo', 'dosis'], t.id).toContain(t.caudal)
  })
  it('rechaza uno desconocido o ausente', () => {
    const malo = clon()
    ;(malo.tramos[0] as { caudal: string }).caudal = 'mucho'
    expect(esquemaConexiones.safeParse(malo).success).toBe(false)
    const falta = clon()
    delete (falta.tramos[0] as { caudal?: string }).caudal
    expect(esquemaConexiones.safeParse(falta).success).toBe(false)
  })
  it('antes del homogeneizador es "entrada", después "salida", los ramales de sedimentadores "mitad" y los lodos "lodo"', () => {
    const c = (id: string) => datos.tramos.find((t) => t.id === id)!.caudal
    expect(['T01', 'T04', 'T06'].map(c)).toEqual(['entrada', 'entrada', 'entrada'])
    expect(['T07', 'T09', 'T12', 'T13', 'T18', 'T21'].map(c)).toEqual(Array(6).fill('salida'))
    expect(['T14', 'T15', 'T16', 'T17'].map(c)).toEqual(Array(4).fill('mitad'))
    expect(['T22', 'T28'].map(c)).toEqual(['lodo', 'lodo'])
    expect(c('T29')).toBe('dosis')
  })
})

describe('rutas y perlas', () => {
  const rutas = construirRutas(construirTramos(datos, referencia), datos.tramos)
  it('hay una ruta por tramo y su largo es la suma de sus segmentos', () => {
    expect(rutas).toHaveLength(datos.tramos.length)
    for (const r of rutas) expect(r.largo).toBeCloseTo(r.acumulado[r.acumulado.length - 1], 6)
  })
  it('cada ruta trae el caudal de su tramo, buscado por id', () => {
    for (const r of rutas) expect(r.caudal).toBe(datos.tramos.find((t) => t.id === r.id)!.caudal)
  })
  it('la perla va del inicio al final en el sentido del flujo y da la vuelta', () => {
    const r = rutas[0]
    const ini = puntoEnRuta(r, 0)
    const fin = puntoEnRuta(r, r.largo - 1e-6)
    expect(ini).toEqual(r.puntos[0])
    expect(fin[0]).toBeCloseTo(r.puntos[r.puntos.length - 1][0], 3)
    expect(puntoEnRuta(r, r.largo + 0.5)).toEqual(puntoEnRuta(r, 0.5))
    expect(puntoEnRuta(r, -0.5)).toEqual(puntoEnRuta(r, r.largo - 0.5))
  })
  it('un punto a media ruta de un tramo recto está en medio', () => {
    const recta = { puntos: [[0, 0, 0], [10, 0, 0]] as [number, number, number][], acumulado: [0, 10], largo: 10 }
    expect(puntoEnRuta({ id: 'x', color: '', radio: 0.1, caudal: 'salida', ...recta }, 5)).toEqual([5, 0, 0])
  })
  it('hay más perlas en un tramo largo y menos en calidad baja, y siempre al menos una', () => {
    expect(cantidadPerlas(24, 'alta')).toBe(20)
    expect(cantidadPerlas(24, 'baja')).toBe(10)
    expect(cantidadPerlas(0.3, 'baja')).toBe(1)
  })
})

describe('velocidad visual', () => {
  const v = (caudal: DatosCaudal, q: number, prom = 5) => velocidadTramo(caudal, { entrada: q, salida: q, promedio: prom })
  type DatosCaudal = Parameters<typeof velocidadTramo>[0]
  it('más caudal = más velocidad, con topes', () => {
    expect(v('entrada', 10)).toBeGreaterThan(v('entrada', 5))
    expect(v('entrada', 5)).toBeCloseTo(1.2, 6)
    expect(v('entrada', 1000)).toBe(3)
    expect(v('entrada', 0.01)).toBe(0.15)
  })
  it('caudal 0 = quieto', () => {
    expect(v('salida', 0)).toBe(0)
  })
  it('la mitad se mueve a la mitad del caudal; lodo y dosis, lento y fijo aunque no haya caudal', () => {
    expect(v('mitad', 10)).toBeCloseTo(v('entrada', 5), 6)
    expect(v('lodo', 0)).toBeGreaterThan(0)
    expect(v('dosis', 0)).toBe(v('lodo', 100))
  })
})
