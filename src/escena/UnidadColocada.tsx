import { useMemo } from 'react'
import { useSeleccion } from '../estado/seleccion'
import { ContextoUbicacion } from '../unidades/contextoUbicacion'
import type { Unidad } from '../unidades/tipos'
import { giroEscena, posicionEscena } from '../unidades/ubicar'

/** Píxeles que puede moverse el mouse entre apretar y soltar para seguir contando como clic. */
const UMBRAL_ARRASTRE_PX = 4

/** Pone una unidad en su lugar del plano general y le avisa dónde está. */
export function UnidadColocada({ unidad, referencia }: { unidad: Unidad; referencia: number }) {
  const ubicacion = useMemo(() => ({ id: unidad.id, posicion: posicionEscena(unidad, referencia), giro: giroEscena(unidad), tamano: unidad.tamano }), [unidad, referencia])
  return (
    <ContextoUbicacion.Provider value={ubicacion}>
      <group
        userData={{ unidad: unidad.id }}
        position={ubicacion.posicion}
        rotation={[0, ubicacion.giro, 0]}
        onClick={(e) => {
          // Un arrastre del mouse (girar la cámara) no es un clic.
          if (e.delta > UMBRAL_ARRASTRE_PX) return
          e.stopPropagation()
          useSeleccion.getState().seleccionar(unidad.id)
        }}
      >
        <unidad.Componente />
      </group>
    </ContextoUbicacion.Provider>
  )
}
