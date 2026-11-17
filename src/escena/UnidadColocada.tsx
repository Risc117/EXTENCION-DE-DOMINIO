import { useMemo } from 'react'
import { ContextoUbicacion } from '../unidades/contextoUbicacion'
import type { Unidad } from '../unidades/tipos'
import { giroEscena, posicionEscena } from '../unidades/ubicar'

/** Pone una unidad en su lugar del plano general y le avisa dónde está. */
export function UnidadColocada({ unidad, referencia }: { unidad: Unidad; referencia: number }) {
  const ubicacion = useMemo(() => ({ posicion: posicionEscena(unidad, referencia), giro: giroEscena(unidad), tamano: unidad.tamano }), [unidad, referencia])
  return (
    <ContextoUbicacion.Provider value={ubicacion}>
      <group position={ubicacion.posicion} rotation={[0, ubicacion.giro, 0]}>
        <unidad.Componente />
      </group>
    </ContextoUbicacion.Provider>
  )
}
