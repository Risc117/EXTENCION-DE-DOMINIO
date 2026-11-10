import { beforeEach, describe, expect, it } from 'vitest'
import { useSim } from './simulacion'

describe('estado de la simulación', () => {
  beforeEach(() => useSim.getState().reiniciar())

  it('arranca vacío, en el día 1, hora 0 y modo constante', () => {
    const s = useSim.getState()
    expect(s.volumen).toBe(0)
    expect(s.hora).toBe(0)
    expect(s.dia).toBe(1)
    expect(s.modoSalida).toBe('constante')
    expect(s.salidaAjuste).toBeNull()
  })

  it('elegir otro día reinicia la hora, el volumen y el ajuste de salida', () => {
    const s = useSim.getState()
    s.publicar({ hora: 10, volumen: 80 })
    s.fijarSalidaAjuste(9)
    s.elegirDia(3)
    const n = useSim.getState()
    expect(n.dia).toBe(3)
    expect(n.hora).toBe(0)
    expect(n.volumen).toBe(0)
    expect(n.salidaAjuste).toBeNull()
  })

  it('play/pausa, velocidad y modo se pueden cambiar', () => {
    const s = useSim.getState()
    const antes = s.corriendo
    s.alternarCorriendo()
    expect(useSim.getState().corriendo).toBe(!antes)
    s.fijarVelocidad(3600)
    s.fijarModoSalida('gravedad')
    expect(useSim.getState().velocidad).toBe(3600)
    expect(useSim.getState().modoSalida).toBe('gravedad')
  })
})
