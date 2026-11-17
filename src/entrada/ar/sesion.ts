import { useAR } from '../../estado/ar'
import { soportaAR } from '../../nucleo/ar/soporte'

let entrando = false

/** Pregunta una vez al navegador si admite AR y lo guarda: si no, el botón "AR" no aparece. */
export async function detectarSoporteAR(): Promise<void> {
  useAR.getState().fijarSoportado(await soportaAR(navigator.xr))
}

/**
 * Pide la sesión de AR (hay que llamarla al tocar el botón): con detección de superficies y, si el navegador deja, la capa de interfaz
 * `raiz` encima de la cámara. Si el navegador la niega, no pasa nada.
 */
export async function entrarAR(raiz: HTMLElement | null): Promise<void> {
  if (useAR.getState().activo || entrando || !navigator.xr) return
  entrando = true
  try {
    const sesion = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test'],
      optionalFeatures: raiz ? ['dom-overlay', 'local-floor'] : ['local-floor'],
      ...(raiz ? { domOverlay: { root: raiz } } : {}),
    })
    sesion.addEventListener('end', () => useAR.getState().salir())
    useAR.getState().entrar(sesion)
  } catch {
    // el navegador no dio la sesión (permiso negado o sin soporte): se queda en la vista normal
  } finally {
    entrando = false
  }
}

/** Termina la sesión de AR (el estado se limpia solo cuando la sesión avisa que terminó). */
export function salirAR(): void {
  useAR.getState().sesion?.end().catch(() => undefined)
}
