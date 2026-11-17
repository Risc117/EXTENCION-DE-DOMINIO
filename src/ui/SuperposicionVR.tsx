import { useRef } from 'react'
import { TEXTO_VR as T } from '../nucleo/textosVR'
import { useVR } from '../estado/vr'
import { TarjetaUnidad } from './TarjetaUnidad'

/** Largo del círculo del anillo de la mira (circunferencia de radio 18 en un dibujo de 44). */
const RADIO_ANILLO = 18
const CIRCUNFERENCIA = 2 * Math.PI * RADIO_ANILLO

/** Lo que se ve encima de cada ojo: la mira con su anillo de avance, la tarjeta de la estructura y la ayuda. */
function Mitad() {
  const progreso = useVR((s) => s.mirada.progreso)
  return (
    <div className="vr__mitad">
      <svg className="vr__mira" viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
        <circle cx="22" cy="22" r="2.5" className="vr__punto" />
        <circle cx="22" cy="22" r={RADIO_ANILLO} className="vr__anillo-fondo" />
        <circle cx="22" cy="22" r={RADIO_ANILLO} className="vr__anillo" strokeDasharray={`${progreso * CIRCUNFERENCIA} ${CIRCUNFERENCIA}`} transform="rotate(-90 22 22)" />
      </svg>
      <TarjetaUnidad />
      <p className="vr__ayuda">{T.ayuda}</p>
    </div>
  )
}

/**
 * Capa de la VR: dos mitades iguales (una por ojo) con la mira y la tarjeta. Tocar la pantalla actúa sobre lo que se mira (como el botón del visor);
 * arrastrar el dedo mira alrededor cuando el celular no manda el giroscopio. `salir` y `mirarArrastrando` llegan por propiedades para no mezclar capas.
 */
export function SuperposicionVR({ salir, mirarArrastrando }: { salir: () => void; mirarArrastrando: (dx: number, dy: number) => void }) {
  const activo = useVR((s) => s.activo)
  const arrastre = useRef({ x: 0, y: 0, mueve: false })
  if (!activo) return null
  return (
    <div
      className="vr"
      onPointerDown={(e) => {
        arrastre.current = { x: e.clientX, y: e.clientY, mueve: false }
      }}
      onPointerMove={(e) => {
        if (e.buttons === 0 && e.pointerType === 'mouse') return
        const a = arrastre.current
        const [dx, dy] = [e.clientX - a.x, e.clientY - a.y]
        arrastre.current = { x: e.clientX, y: e.clientY, mueve: a.mueve || Math.abs(dx) + Math.abs(dy) > 3 }
        mirarArrastrando(dx, dy)
      }}
      onPointerUp={() => {
        if (!arrastre.current.mueve) useVR.getState().tocar()
      }}
    >
      <Mitad />
      <Mitad />
      <button type="button" className="vr__salir" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onClick={salir}>
        {T.salir}
      </button>
    </div>
  )
}
