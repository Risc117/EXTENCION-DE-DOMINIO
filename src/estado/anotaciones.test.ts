import { beforeEach, describe, expect, it } from 'vitest'
import { useAnotaciones } from './anotaciones'

beforeEach(() => useAnotaciones.setState({ cotas: true, etiquetas: true, siempre: false }))

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

describe('mostrar de lejos', () => {
  it('por defecto las cotas y etiquetas solo salen al acercarse (siempre = false) y un botón lo cambia', () => {
    expect(useAnotaciones.getState().siempre).toBe(false)
    useAnotaciones.getState().alternarSiempre()
    expect(useAnotaciones.getState().siempre).toBe(true)
    expect(useAnotaciones.getState().cotas).toBe(true)
    useAnotaciones.getState().alternarSiempre()
    expect(useAnotaciones.getState().siempre).toBe(false)
  })
})
