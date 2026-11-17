import { describe, expect, it } from 'vitest'
import { useLineaViva } from './lineaViva'
import { useSeleccion } from './seleccion'

describe('línea viva', () => {
  it('guarda la estructura de la línea y los caudales publicados', () => {
    useLineaViva.getState().publicarEstructura([{ id: 'a', retencion: null, destinos: [], columna: 0, fila: 0 }])
    useLineaViva.getState().publicarCaudales({ a: { entrada: 1, salida: 2 } })
    expect(useLineaViva.getState().nodos).toHaveLength(1)
    expect(useLineaViva.getState().caudales.a).toEqual({ entrada: 1, salida: 2 })
  })
})

describe('selección de una estructura', () => {
  it('se selecciona, se cambia y se limpia', () => {
    expect(useSeleccion.getState().id).toBeNull()
    useSeleccion.getState().seleccionar('rafa')
    expect(useSeleccion.getState().id).toBe('rafa')
    useSeleccion.getState().seleccionar(null)
    expect(useSeleccion.getState().id).toBeNull()
  })
})
