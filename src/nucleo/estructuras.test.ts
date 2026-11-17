import { describe, expect, it } from 'vitest'
import { estructuraVecina } from './estructuras'

const ids = ['bombeo', 'rejas', 'desarenador']

describe('estructura vecina (siguiente y anterior en el orden de la planta)', () => {
  it('avanza y retrocede una estructura', () => {
    expect(estructuraVecina(ids, 'rejas', 1)).toBe('desarenador')
    expect(estructuraVecina(ids, 'rejas', -1)).toBe('bombeo')
  })
  it('da la vuelta al llegar al final o al principio', () => {
    expect(estructuraVecina(ids, 'desarenador', 1)).toBe('bombeo')
    expect(estructuraVecina(ids, 'bombeo', -1)).toBe('desarenador')
  })
  it('desde la vista general, "siguiente" va a la primera y "anterior" a la última', () => {
    expect(estructuraVecina(ids, null, 1)).toBe('bombeo')
    expect(estructuraVecina(ids, null, -1)).toBe('desarenador')
  })
  it('con un foco que no está en la lista actúa como desde la vista general', () => {
    expect(estructuraVecina(ids, 'otra', 1)).toBe('bombeo')
  })
  it('sin estructuras no hay a dónde ir', () => {
    expect(estructuraVecina([], null, 1)).toBeNull()
  })
})
