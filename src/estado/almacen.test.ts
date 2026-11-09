import { beforeEach, describe, expect, it } from 'vitest'
import { AJUSTE_GESTOS_DEFECTO, DISTANCIA_INICIAL, ELEVACION_MAXIMA, ELEVACION_MINIMA, ZOOM_MAXIMO, ZOOM_MINIMO } from '../nucleo/constantes'
import { useEstado } from './almacen'

beforeEach(() => useEstado.getState().reiniciarCamara())

describe('intenciones de cámara', () => {
  it('girar suma al acimut y a la elevación', () => {
    const antes = useEstado.getState().camara
    useEstado.getState().girar(0.2, 0.1)
    const c = useEstado.getState().camara
    expect(c.acimut).toBeCloseTo(antes.acimut + 0.2)
    expect(c.elevacion).toBeCloseTo(antes.elevacion + 0.1)
  })

  it('la elevación queda dentro de sus límites', () => {
    useEstado.getState().girar(0, 100)
    expect(useEstado.getState().camara.elevacion).toBe(ELEVACION_MAXIMA)
    useEstado.getState().girar(0, -100)
    expect(useEstado.getState().camara.elevacion).toBe(ELEVACION_MINIMA)
  })

  it('el zoom multiplica la distancia y respeta los límites', () => {
    useEstado.getState().hacerZoom(0.5)
    expect(useEstado.getState().camara.distancia).toBeCloseTo(DISTANCIA_INICIAL * 0.5)
    useEstado.getState().hacerZoom(1000)
    expect(useEstado.getState().camara.distancia).toBe(ZOOM_MAXIMO)
    useEstado.getState().hacerZoom(0.0001)
    expect(useEstado.getState().camara.distancia).toBe(ZOOM_MINIMO)
  })

  it('pausar y reanudar', () => {
    useEstado.getState().fijarPausa(true)
    expect(useEstado.getState().pausado).toBe(true)
    useEstado.getState().fijarPausa(false)
    expect(useEstado.getState().pausado).toBe(false)
  })
})

describe('estado de los gestos', () => {
  it('empieza apagado y sin mano', () => {
    const s = useEstado.getState()
    expect(s.gestos).toBe('apagado')
    expect(s.manoDetectada).toBe(false)
  })

  it('apagar los gestos limpia la mano detectada', () => {
    useEstado.getState().fijarManoDetectada(true)
    useEstado.getState().fijarGestos('apagado')
    expect(useEstado.getState().manoDetectada).toBe(false)
  })
})

describe('panel de ajuste retráctil', () => {
  it('arranca plegado', () => {
    expect(useEstado.getState().panelAjusteAbierto).toBe(false)
  })

  it('alternar abre y cierra sin tocar los valores', () => {
    useEstado.getState().cambiarAjusteGestos({ giro: 5 })
    useEstado.getState().alternarPanelAjuste()
    expect(useEstado.getState().panelAjusteAbierto).toBe(true)
    useEstado.getState().alternarPanelAjuste()
    expect(useEstado.getState().panelAjusteAbierto).toBe(false)
    expect(useEstado.getState().ajusteGestos.giro).toBe(5)
    useEstado.getState().restablecerAjusteGestos()
  })
})

describe('ajuste de gestos', () => {
  it('empieza con los valores por defecto', () => {
    expect(useEstado.getState().ajusteGestos).toEqual(AJUSTE_GESTOS_DEFECTO)
  })

  it('cambiar un valor no toca los demás y restablecer los devuelve', () => {
    useEstado.getState().cambiarAjusteGestos({ giro: 5 })
    expect(useEstado.getState().ajusteGestos).toEqual({ ...AJUSTE_GESTOS_DEFECTO, giro: 5 })
    useEstado.getState().restablecerAjusteGestos()
    expect(useEstado.getState().ajusteGestos).toEqual(AJUSTE_GESTOS_DEFECTO)
  })
})
