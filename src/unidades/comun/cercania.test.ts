import { describe, expect, it } from 'vitest'
import { DISTANCIA_ANOTACIONES, DISTANCIA_ETIQUETA_TUBERIA, HISTERESIS_ANOTACIONES } from '../../nucleo/constantesVista'
import { anotacionesVisibles, estaCerca, etiquetasCercanas } from './cercania'

describe('estaCerca (cotas y etiquetas solo al acercarse a una estructura)', () => {
  it('se enciende cuando la cámara está a menos de DISTANCIA_ANOTACIONES veces el tamaño de la unidad', () => {
    const tamano = 10
    expect(estaCerca(tamano * DISTANCIA_ANOTACIONES - 0.1, tamano, false)).toBe(true)
    expect(estaCerca(tamano * DISTANCIA_ANOTACIONES + 0.1, tamano, false)).toBe(false)
  })

  it('desde la vista general (mucho más lejos que cualquier unidad) no hay anotaciones', () => {
    expect(estaCerca(300, 22.4, false)).toBe(false)
    expect(estaCerca(300, 2, false)).toBe(false)
  })

  it('al volar a una unidad (distancia inicial ≈ 2.84 veces su tamaño) sí se encienden', () => {
    for (const tamano of [2.4, 8, 15.2, 22.4]) expect(estaCerca(2.84 * tamano, tamano, false)).toBe(true)
  })

  it('no parpadea en el borde: una vez encendidas se apagan solo un poco más lejos (histéresis)', () => {
    const tamano = 10
    const borde = tamano * DISTANCIA_ANOTACIONES
    expect(estaCerca(borde + 0.1, tamano, true)).toBe(true)
    expect(estaCerca(borde * HISTERESIS_ANOTACIONES + 0.1, tamano, true)).toBe(false)
    expect(HISTERESIS_ANOTACIONES).toBeGreaterThan(1)
  })
})

describe('anotacionesVisibles', () => {
  const cerca = { cotas: true, etiquetas: true, siempre: false }
  it('con los botones activos aparecen solo cuando se está cerca', () => {
    expect(anotacionesVisibles(cerca, true)).toEqual({ cotas: true, etiquetas: true })
    expect(anotacionesVisibles(cerca, false)).toEqual({ cotas: false, etiquetas: false })
  })

  it('un botón apagado las oculta aunque se esté cerca, y cada uno es independiente', () => {
    expect(anotacionesVisibles({ ...cerca, cotas: false }, true)).toEqual({ cotas: false, etiquetas: true })
    expect(anotacionesVisibles({ ...cerca, etiquetas: false }, true)).toEqual({ cotas: true, etiquetas: false })
  })

  it('con "mostrar también de lejos" aparecen a cualquier distancia', () => {
    expect(anotacionesVisibles({ ...cerca, siempre: true }, false)).toEqual({ cotas: true, etiquetas: true })
    expect(anotacionesVisibles({ cotas: false, etiquetas: false, siempre: true }, false)).toEqual({ cotas: false, etiquetas: false })
  })
})

describe('etiquetasCercanas (las etiquetas de las tuberías)', () => {
  const etiquetas = [
    { id: 'a', punta: [0, 0, 0] as [number, number, number] },
    { id: 'b', punta: [100, 0, 0] as [number, number, number] },
    { id: 'c', punta: [0, 0, 50] as [number, number, number] },
  ]
  it('deja solo las que están a menos de DISTANCIA_ETIQUETA_TUBERIA de la cámara', () => {
    const camara: [number, number, number] = [5, 10, 0]
    const ids = etiquetasCercanas(camara, etiquetas, DISTANCIA_ETIQUETA_TUBERIA).map((e) => e.id)
    expect(ids).toEqual(['a'])
    expect(etiquetasCercanas([90, 10, 0], etiquetas, DISTANCIA_ETIQUETA_TUBERIA).map((e) => e.id)).toEqual(['b'])
    expect(etiquetasCercanas([300, 10, 300], etiquetas, DISTANCIA_ETIQUETA_TUBERIA)).toEqual([])
  })

  it('sin límite (ver siempre) devuelve todas', () => {
    expect(etiquetasCercanas([0, 0, 0], etiquetas, Infinity)).toHaveLength(3)
  })
})
