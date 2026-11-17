import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAR } from './ar'
import { useCalidad } from './calidad'

const sesion = {} as XRSession

describe('modo AR', () => {
  const guardar = vi.fn()
  beforeEach(() => {
    guardar.mockClear()
    useCalidad.setState({ calidad: 'alta', fijarCalidad: guardar })
    useAR.setState({ soportado: false, activo: false, sesion: null, fase: 'buscando', colocacion: null, calidadPrevia: null })
  })
  it('el botón se oculta por defecto (no soportado) y se muestra solo si el navegador lo soporta', () => {
    expect(useAR.getState().soportado).toBe(false)
    useAR.getState().fijarSoportado(true)
    expect(useAR.getState().soportado).toBe(true)
  })
  it('entrar pasa a calidad baja y salir devuelve la que había, sin guardar la preferencia', () => {
    useAR.getState().entrar(sesion)
    expect(useAR.getState().activo).toBe(true)
    expect(useAR.getState().sesion).toBe(sesion)
    expect(useCalidad.getState().calidad).toBe('baja')
    useAR.getState().salir()
    expect(useAR.getState().activo).toBe(false)
    expect(useAR.getState().sesion).toBeNull()
    expect(useCalidad.getState().calidad).toBe('alta')
    expect(guardar).not.toHaveBeenCalled()
  })
  it('entrar dos veces no pierde la calidad original; salir sin entrar no cambia nada', () => {
    useAR.getState().salir()
    expect(useCalidad.getState().calidad).toBe('alta')
    useAR.getState().entrar(sesion)
    useAR.getState().entrar(sesion)
    useAR.getState().salir()
    expect(useCalidad.getState().calidad).toBe('alta')
  })
  it('empieza buscando; con una superficie pasa a lista y puede volver a buscando', () => {
    useAR.getState().entrar(sesion)
    expect(useAR.getState().fase).toBe('buscando')
    useAR.getState().evento('superficie')
    expect(useAR.getState().fase).toBe('lista')
    useAR.getState().evento('sinSuperficie')
    expect(useAR.getState().fase).toBe('buscando')
  })
  it('colocar solo funciona con una superficie lista y deja la maqueta en el punto', () => {
    useAR.getState().entrar(sesion)
    useAR.getState().colocar([1, 0, -1])
    expect(useAR.getState().colocacion).toBeNull()
    useAR.getState().evento('superficie')
    useAR.getState().colocar([1, 0.7, -1])
    expect(useAR.getState().fase).toBe('colocada')
    expect(useAR.getState().colocacion).toEqual([1, 0.7, -1])
  })
  it('volver a colocar borra la posición y vuelve a buscar', () => {
    useAR.getState().entrar(sesion)
    useAR.getState().evento('superficie')
    useAR.getState().colocar([1, 0, 1])
    useAR.getState().evento('recolocar')
    expect(useAR.getState().fase).toBe('buscando')
    expect(useAR.getState().colocacion).toBeNull()
  })
  it('al salir se olvida la colocación', () => {
    useAR.getState().entrar(sesion)
    useAR.getState().evento('superficie')
    useAR.getState().colocar([1, 0, 1])
    useAR.getState().salir()
    expect(useAR.getState().colocacion).toBeNull()
    expect(useAR.getState().fase).toBe('buscando')
  })
})
