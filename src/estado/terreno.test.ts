import { beforeEach, describe, expect, it } from 'vitest'
import { TEXTO_TERRENO } from '../nucleo/textos'
import { useTerreno } from './terreno'

describe('interruptor del terreno', () => {
  beforeEach(() => useTerreno.setState({ terrenoVisible: true, curvasVisibles: true }))

  it('el terreno empieza visible y el botón lo oculta y lo vuelve a mostrar', () => {
    expect(useTerreno.getState().terrenoVisible).toBe(true)
    useTerreno.getState().alternarTerreno()
    expect(useTerreno.getState().terrenoVisible).toBe(false)
    useTerreno.getState().alternarTerreno()
    expect(useTerreno.getState().terrenoVisible).toBe(true)
  })

  it('es independiente de las curvas de nivel', () => {
    useTerreno.getState().alternarTerreno()
    expect(useTerreno.getState().curvasVisibles).toBe(true)
    useTerreno.getState().alternarCurvas()
    expect(useTerreno.getState().terrenoVisible).toBe(false)
  })

  it('los textos del botón existen', () => {
    expect(TEXTO_TERRENO.terrenoOcultar).toBe('Ocultar terreno')
    expect(TEXTO_TERRENO.terrenoMostrar).toBe('Mostrar terreno')
  })
})
