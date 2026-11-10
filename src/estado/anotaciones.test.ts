import { beforeEach, describe, expect, it } from 'vitest'
import { useAnotaciones } from './anotaciones'

beforeEach(() => useAnotaciones.setState({ cotas: true, etiquetas: true }))

describe('estado de las anotaciones', () => {
  it('cotas y etiquetas arrancan visibles', () => {
    expect(useAnotaciones.getState().cotas).toBe(true)
    expect(useAnotaciones.getState().etiquetas).toBe(true)
  })

  it('cada botón alterna solo lo suyo', () => {
    useAnotaciones.getState().alternarCotas()
    expect(useAnotaciones.getState().cotas).toBe(false)
    expect(useAnotaciones.getState().etiquetas).toBe(true)
    useAnotaciones.getState().alternarEtiquetas()
    expect(useAnotaciones.getState().etiquetas).toBe(false)
    useAnotaciones.getState().alternarCotas()
    expect(useAnotaciones.getState().cotas).toBe(true)
  })
})
