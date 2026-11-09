import { CLAVE_PANEL_AJUSTE } from '../nucleo/constantes'

export type Almacenamiento = Pick<Storage, 'getItem' | 'setItem'>

const VALOR_ABIERTO = 'abierto'
const VALOR_CERRADO = 'cerrado'

/** El almacenamiento del navegador, o undefined si no existe o está bloqueado. */
export function almacenamientoNavegador(): Almacenamiento | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

/** true solo si el usuario lo dejó abierto; en cualquier otro caso, plegado. */
export function leerPanelAbierto(alm: Almacenamiento | undefined = almacenamientoNavegador()): boolean {
  try {
    return alm?.getItem(CLAVE_PANEL_AJUSTE) === VALOR_ABIERTO
  } catch {
    return false
  }
}

export function guardarPanelAbierto(abierto: boolean, alm: Almacenamiento | undefined = almacenamientoNavegador()): void {
  try {
    alm?.setItem(CLAVE_PANEL_AJUSTE, abierto ? VALOR_ABIERTO : VALOR_CERRADO)
  } catch {
    // sin almacenamiento: el panel sigue funcionando, solo no se recuerda
  }
}
