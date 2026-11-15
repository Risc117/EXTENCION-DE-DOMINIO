import { describe, expect, it } from 'vitest'
import { crearRetraso } from './retraso'

describe('retraso puro', () => {
  it('sin retención pasa el caudal al instante', () => {
    const r = crearRetraso(0)
    expect(r.paso(3, 10)).toBe(3)
    expect(r.paso(7, 10)).toBe(7)
  })

  it('con retención de 30 s entrega el caudal 30 s después', () => {
    const r = crearRetraso(30)
    const salidas = [1, 2, 3, 4, 5, 6].map((q) => r.paso(q, 10))
    // pasos que empiezan en 0,10,20,30,40,50 s → sale lo que entró 30 s antes
    expect(salidas).toEqual([1, 1, 1, 1, 2, 3])
  })

  it('en régimen constante sale lo mismo que entra', () => {
    const r = crearRetraso(3600)
    let s = 0
    for (let i = 0; i < 500; i++) s = r.paso(8, 60)
    expect(s).toBe(8)
  })
})
