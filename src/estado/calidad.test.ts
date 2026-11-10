import { describe, expect, it } from 'vitest'
import { CALIDAD_PARTICULAS, CLAVE_CALIDAD, NUMERO_PARTICULAS } from '../nucleo/constantes'
import { cantidadParticulas, useCalidad } from './calidad'
import { guardarCalidad, leerCalidad } from './preferenciaCalidad'

function memoria(inicial?: string) {
  const datos = new Map<string, string>(inicial ? [[CLAVE_CALIDAD, inicial]] : [])
  return { getItem: (k: string) => datos.get(k) ?? null, setItem: (k: string, v: string) => void datos.set(k, v) }
}

describe('calidad de las partículas', () => {
  it('baja = 150 y alta = 400, y el buffer cubre la alta', () => {
    expect(cantidadParticulas('baja')).toBe(150)
    expect(cantidadParticulas('alta')).toBe(400)
    expect(NUMERO_PARTICULAS).toBe(CALIDAD_PARTICULAS.alta)
  })

  it('el selector cambia la calidad en el estado', () => {
    useCalidad.getState().fijarCalidad('baja')
    expect(useCalidad.getState().calidad).toBe('baja')
    useCalidad.getState().fijarCalidad('alta')
    expect(useCalidad.getState().calidad).toBe('alta')
  })
})

describe('preferencia de calidad', () => {
  it('recuerda lo guardado', () => {
    const alm = memoria()
    guardarCalidad('baja', alm)
    expect(leerCalidad(alm, 1600)).toBe('baja')
  })

  it('sin nada guardado: alta en pantalla grande y baja en celular', () => {
    expect(leerCalidad(memoria(), 1600)).toBe('alta')
    expect(leerCalidad(memoria(), 390)).toBe('baja')
  })

  it('ignora un valor guardado que no sirve', () => {
    expect(leerCalidad(memoria('ultra'), 1600)).toBe('alta')
  })

  it('funciona aunque no haya almacenamiento', () => {
    expect(leerCalidad(undefined, 1600)).toBe('alta')
    expect(() => guardarCalidad('baja', undefined)).not.toThrow()
  })
})
