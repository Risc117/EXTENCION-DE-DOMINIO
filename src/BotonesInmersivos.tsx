import { useEffect } from 'react'
import { entrarVR, mirarArrastrando, salirVR } from './entrada/vr/sensor'
import { TEXTO_VR } from './nucleo/textosVR'
import { useVR } from './estado/vr'
import { SuperposicionVR } from './ui/SuperposicionVR'

/** Botón "VR" y la capa de la VR. Vive en la raíz porque el permiso del giroscopio debe pedirse al tocar el botón, dentro de la entrada. */
export function BotonesInmersivos() {
  const vr = useVR((s) => s.activo)
  const salidaPedida = useVR((s) => s.salidaPedida)
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
      {!vr && (
        <div className="botones-inmersivos">
          <button type="button" onClick={() => void entrarVR()}>
            {TEXTO_VR.entrar}
          </button>
        </div>
      )}
      <SuperposicionVR salir={salirVR} mirarArrastrando={mirarArrastrando} />
    </>
  )
}
