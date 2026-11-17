import { useEffect, useRef } from 'react'
import { TEXTO_AR as T } from '../nucleo/textosAR'
import { useAR } from '../estado/ar'
import { TarjetaUnidad } from './TarjetaUnidad'

/**
 * Capa de la AR: es la que el navegador muestra encima de la cámara (dom-overlay), por eso existe siempre con su id.
 * Dice qué hacer en cada fase, deja volver a colocar y salir, y muestra la tarjeta de la estructura tocada.
 */
export function SuperposicionAR({ salir }: { salir: () => void }) {
  const activo = useAR((s) => s.activo)
  const fase = useAR((s) => s.fase)
  const evento = useAR((s) => s.evento)
  const raiz = useRef<HTMLDivElement>(null)
  // Un toque en un botón o en la tarjeta no debe contar también como toque sobre la maqueta.
  useEffect(() => {
    const el = raiz.current
    const evitar = (e: Event) => e.preventDefault()
    el?.addEventListener('beforexrselect', evitar)
    return () => el?.removeEventListener('beforexrselect', evitar)
  }, [])
  return (
    <div id="superposicion-ar" ref={raiz} className="ar">
      {activo && (
        <>
          <p className="ar__guia" role="status">
            {T[fase]}
          </p>
          <div className="ar__botones">
            {fase === 'colocada' && (
              <button type="button" onClick={() => evento('recolocar')}>
                {T.recolocar}
              </button>
            )}
            <button type="button" onClick={salir}>
              {T.salir}
            </button>
          </div>
          <TarjetaUnidad />
        </>
      )}
    </div>
  )
}
