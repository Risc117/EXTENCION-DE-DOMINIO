import { describe, expect, it } from 'vitest'
import { CLAVE_PANEL_AJUSTE } from '../nucleo/constantes'
import { guardarPanelAbierto, leerPanelAbierto, type Almacenamiento } from './preferenciaPanel'

const memoria = (): Almacenamiento & { datos: Map<string, string> } => {
  const datos = new Map<string, string>()
  return {
    datos,
    getItem: (k) => datos.get(k) ?? null,
    setItem: (k, v) => void datos.set(k, v),
  }
}

const roto: Almacenamiento = {
  getItem: () => {
    throw new Error('bloqueado')
  },
  setItem: () => {
    throw new Error('bloqueado')
  },
}

describe('preferencia del panel de ajuste', () => {
  it('sin nada guardado queda plegado', () => {
    expect(leerPanelAbierto(memoria())).toBe(false)
  })

  it('recuerda abierto y recuerda cerrado', () => {
    const alm = memoria()
    guardarPanelAbierto(true, alm)
    expect(leerPanelAbierto(alm)).toBe(true)
    guardarPanelAbierto(false, alm)
    expect(leerPanelAbierto(alm)).toBe(false)
  })

  it('usa la clave de constantes', () => {
    const alm = memoria()
    guardarPanelAbierto(true, alm)
    expect(alm.datos.has(CLAVE_PANEL_AJUSTE)).toBe(true)
  })

  it('un valor desconocido se trata como plegado', () => {
    const alm = memoria()
    alm.setItem(CLAVE_PANEL_AJUSTE, 'basura')
    expect(leerPanelAbierto(alm)).toBe(false)
  })

  it('si el almacenamiento falla o no existe, no rompe y queda plegado', () => {
    expect(leerPanelAbierto(roto)).toBe(false)
    expect(() => guardarPanelAbierto(true, roto)).not.toThrow()
    expect(leerPanelAbierto(undefined)).toBe(false)
    expect(() => guardarPanelAbierto(true, undefined)).not.toThrow()
  })
})
