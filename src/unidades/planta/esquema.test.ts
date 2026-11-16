import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/planta.json'
import { esquemaPlanta, unidadPlantaEsDemo } from './esquema'

const copia = () => structuredClone(crudo) as unknown as { unidades: Record<string, unknown>[] }

describe('datos/planta.json', () => {
  it('es válido', () => {
    expect(esquemaPlanta.safeParse(crudo).success).toBe(true)
  })

  it('incluye el homogeneizador y las nueve unidades marcadoras del ticket', () => {
    const ids = esquemaPlanta.parse(crudo).unidades.map((u) => u.id)
    for (const id of ['homogeneizador', 'rejas', 'desarenador', 'parshall', 'rafa', 'percolador', 'sedimentador-1', 'sedimentador-2', 'camara-contacto', 'lechos-secado'])
      expect(ids).toContain(id)
  })

  it('acepta coordenadas negativas y giro cero', () => {
    const d = copia()
    d.unidades[0].x = { valor: -12.5, unidad: 'm', fuente: 'prueba' }
    d.unidades[0].giro = { valor: 0, unidad: 'grados', fuente: 'prueba' }
    expect(esquemaPlanta.safeParse(d).success).toBe(true)
  })

  it('rechaza un valor sin fuente', () => {
    const d = copia()
    d.unidades[0].x = { valor: 1, unidad: 'm', fuente: '' }
    expect(esquemaPlanta.safeParse(d).success).toBe(false)
  })

  it('rechaza un valor que no es número', () => {
    const d = copia()
    d.unidades[0].y = { valor: 'diez', unidad: 'm', fuente: 'prueba' }
    expect(esquemaPlanta.safeParse(d).success).toBe(false)
  })

  it('rechaza unidades equivocadas, cota no positiva e ids repetidos', () => {
    const a = copia()
    a.unidades[0].giro = { valor: 90, unidad: 'm', fuente: 'prueba' }
    expect(esquemaPlanta.safeParse(a).success).toBe(false)
    const b = copia()
    b.unidades[0].cotaFondo = { valor: 0, unidad: 'm', fuente: 'prueba' }
    expect(esquemaPlanta.safeParse(b).success).toBe(false)
    const c = copia()
    c.unidades[1].id = c.unidades[0].id
    expect(esquemaPlanta.safeParse(c).success).toBe(false)
  })

  it('rechaza una coronación que no queda sobre el fondo', () => {
    const d = copia()
    d.unidades[0].cotaCoronacion = { ...(d.unidades[0].cotaFondo as object), valor: 1 }
    expect(esquemaPlanta.safeParse(d).success).toBe(false)
  })

  it('detecta si una unidad usa datos de ejemplo', () => {
    const d = esquemaPlanta.parse(crudo)
    expect(unidadPlantaEsDemo(d.unidades[0])).toBe(true)
    const real = { ...d.unidades[0], x: { ...d.unidades[0].x, demo: false }, y: { ...d.unidades[0].y, demo: false }, giro: { ...d.unidades[0].giro, demo: false }, cotaFondo: { ...d.unidades[0].cotaFondo, demo: false }, cotaCoronacion: { ...d.unidades[0].cotaCoronacion, demo: false }, cotaSuperficie: { ...d.unidades[0].cotaSuperficie, demo: false }, radioExplanada: { ...d.unidades[0].radioExplanada, demo: false }, marcador: undefined }
    expect(unidadPlantaEsDemo(real)).toBe(false)
  })
})
