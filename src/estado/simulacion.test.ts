import { beforeEach, describe, expect, it } from 'vitest'
import { HORA_INICIAL_SIMULACION } from '../nucleo/constantesAmbiente'
import { luzDelDia, posicionSol } from '../nucleo/solar'
import ambiente from '../../datos/ambiente.json'
import { useSim } from './simulacion'

describe('estado de la simulación', () => {
  beforeEach(() => useSim.getState().reiniciar())

  it('arranca vacío, en el día 1, a la hora inicial y en modo constante', () => {
    const s = useSim.getState()
    expect(s.volumen).toBe(0)
    expect(s.hora).toBe(HORA_INICIAL_SIMULACION)
    expect(s.dia).toBe(1)
    expect(s.modoSalida).toBe('constante')
    expect(s.salidaAjuste).toBeNull()
  })

  it('a la hora inicial es pleno día en Picoy (el visor no abre de noche)', () => {
    const { elevacion } = posicionSol(ambiente.ubicacion.latitud.valor, ambiente.fecha.mes, ambiente.fecha.dia, HORA_INICIAL_SIMULACION)
    expect(luzDelDia(elevacion).dia).toBe(1)
  })

  it('elegir otro día reinicia la hora, el volumen y el ajuste de salida', () => {
    const s = useSim.getState()
    s.publicar({ hora: 10, volumen: 80 })
    s.fijarSalidaAjuste(9)
    s.elegirDia(3)
    const n = useSim.getState()
    expect(n.dia).toBe(3)
    expect(n.hora).toBe(HORA_INICIAL_SIMULACION)
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

describe('escala del caudal (T9.5)', () => {
  it('publicar guarda la escala y elegir otro día la borra hasta que se publique de nuevo', () => {
    useSim.getState().publicar({ escalaCaudal: { factor: 0.5, caudalDiseno: 6.536, motivo: 'm' } })
    expect(useSim.getState().escalaCaudal?.caudalDiseno).toBe(6.536)
    useSim.getState().reiniciar()
    expect(useSim.getState().escalaCaudal).toBeNull()
  })
})
