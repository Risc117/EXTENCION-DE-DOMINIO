import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCalidad } from './calidad'
import { useVR } from './vr'

describe('modo VR', () => {
  const guardar = vi.fn()
  beforeEach(() => {
    guardar.mockClear()
    useCalidad.setState({ calidad: 'alta', fijarCalidad: guardar })
    useVR.setState({ activo: false, calidadPrevia: null, orientacion: null, yaw: 0, pitch: 0, mirada: { clave: null, progreso: 0 }, posicion: null })
  })
  it('entrar pasa a calidad baja y salir devuelve la que había', () => {
    useVR.getState().entrar()
    expect(useVR.getState().activo).toBe(true)
    expect(useCalidad.getState().calidad).toBe('baja')
    useVR.getState().salir()
    expect(useVR.getState().activo).toBe(false)
    expect(useCalidad.getState().calidad).toBe('alta')
  })
  it('no guarda la preferencia de calidad (ni al entrar ni al salir)', () => {
    useVR.getState().entrar()
    useVR.getState().salir()
    expect(guardar).not.toHaveBeenCalled()
  })
  it('si ya estaba en baja se queda en baja al salir', () => {
    useCalidad.setState({ calidad: 'baja' })
    useVR.getState().entrar()
    useVR.getState().salir()
    expect(useCalidad.getState().calidad).toBe('baja')
  })
  it('entrar dos veces no pierde la calidad original', () => {
    useVR.getState().entrar()
    useVR.getState().entrar()
    useVR.getState().salir()
    expect(useCalidad.getState().calidad).toBe('alta')
  })
  it('salir sin haber entrado no cambia nada', () => {
    useVR.getState().salir()
    expect(useCalidad.getState().calidad).toBe('alta')
  })
  it('al salir se olvida la mirada, la posición y la orientación (la próxima vez empieza de cero)', () => {
    useVR.getState().entrar()
    useVR.setState({ posicion: { x: 5, z: 6 }, yaw: 1, pitch: 0.2, orientacion: [0, 0, 0, 1], mirada: { clave: 'suelo', progreso: 0.5 } })
    useVR.getState().salir()
    const s = useVR.getState()
    expect([s.posicion, s.yaw, s.pitch, s.orientacion, s.mirada.clave]).toEqual([null, 0, 0, null, null])
  })
  it('pedir tocar levanta la bandera una vez y la baja al consumirla', () => {
    useVR.getState().entrar()
    useVR.getState().tocar()
    expect(useVR.getState().tocado).toBe(true)
    expect(useVR.getState().consumirToque()).toBe(true)
    expect(useVR.getState().consumirToque()).toBe(false)
  })
})
