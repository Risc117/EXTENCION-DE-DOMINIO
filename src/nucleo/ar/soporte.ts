/** Lo que se usa de navigator.xr. */
export interface XRSimple {
  isSessionSupported?(modo: 'immersive-ar'): Promise<boolean>
}

/** true si el navegador admite realidad aumentada (WebXR `immersive-ar`); sin WebXR o si la pregunta falla, false (el botón se oculta). */
export async function soportaAR(xr: XRSimple | undefined): Promise<boolean> {
  if (!xr?.isSessionSupported) return false
  try {
    return await xr.isSessionSupported('immersive-ar')
  } catch {
    return false
  }
}
