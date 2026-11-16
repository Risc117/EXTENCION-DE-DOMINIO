import { useMemo } from 'react'
import { RADIO_FLECHA, SEGMENTOS_FLECHA, ORDEN_ANOTACIONES } from '../../nucleo/constantes'
import { geometriaFlecha } from './geometriaFlecha'
import type { Vec3 } from './tiposAnotaciones'

/** Punta de flecha (cono) con su punta en `punta`, mirando hacia `direccion`. Se ve siempre, incluso detrás de piezas. */
export function Flecha({ punta, direccion, largo, color }: { punta: Vec3; direccion: Vec3; largo: number; color: string }) {
  const g = useMemo(() => geometriaFlecha(punta, direccion, largo), [punta, direccion, largo])
  return (
    <mesh position={g.posicion} quaternion={g.cuaternion} renderOrder={ORDEN_ANOTACIONES}>
      <coneGeometry args={[RADIO_FLECHA, largo, SEGMENTOS_FLECHA]} />
      <meshBasicMaterial color={color} depthTest={false} />
    </mesh>
  )
}
