import { useEffect } from 'react'
import { detectarSoporteAR, entrarAR, salirAR } from './entrada/ar/sesion'
import { entrarVR, mirarArrastrando, salirVR } from './entrada/vr/sensor'
import { TEXTO_AR } from './nucleo/textosAR'
import { TEXTO_VR } from './nucleo/textosVR'
import { useAR } from './estado/ar'
import { useVR } from './estado/vr'
import { SuperposicionAR } from './ui/SuperposicionAR'
import { SuperposicionVR } from './ui/SuperposicionVR'

/**
 * Botones "VR" y "AR" y sus capas. Viven en la raíz porque el permiso del giroscopio y la sesión de AR deben pedirse al tocar el botón, dentro de la entrada.
 * El botón "AR" solo aparece si el navegador dice que soporta realidad aumentada.
 */
export function BotonesInmersivos() {
  const vr = useVR((s) => s.activo)
  const ar = useAR((s) => s.activo)
  const arSoportado = useAR((s) => s.soportado)
  const salidaPedida = useVR((s) => s.salidaPedida)
  useEffect(() => {
    void detectarSoporteAR()
  }, [])
  // En VR los textos del dibujo (etiquetas, cotas, marcadores) son del navegador y saldrían una sola vez a pantalla completa: se esconden.
  useEffect(() => {
    document.body.classList.toggle('modo-vr', vr)
    return () => document.body.classList.remove('modo-vr')
  }, [vr])
  // La mira (escena) pide salir por el estado; aquí se devuelve la pantalla y la calidad.
  useEffect(() => {
    if (salidaPedida) salirVR()
  }, [salidaPedida])
  return (
    <>
      {!vr && !ar && (
        <div className="botones-inmersivos">
          <button type="button" onClick={() => void entrarVR()}>
            {TEXTO_VR.entrar}
          </button>
          {arSoportado && (
            <button type="button" onClick={() => void entrarAR(document.getElementById('superposicion-ar'))}>
              {TEXTO_AR.entrar}
            </button>
          )}
        </div>
      )}
      <SuperposicionVR salir={salirVR} mirarArrastrando={mirarArrastrando} />
      <SuperposicionAR salir={salirAR} />
    </>
  )
}
