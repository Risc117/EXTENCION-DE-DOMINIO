import { OPACIDAD_AGUA, SEGMENTOS_CILINDRO } from '../../nucleo/constantes'
import { leerColor } from '../../nucleo/colores'
import { useSim } from '../../estado/simulacion'
import { usePlanosCorte } from './usePlanosCorte'

/** Superficie y masa de agua: un cilindro que crece desde el fondo según el nivel de la simulación. */
export function Agua({ radio }: { radio: number }) {
  const nivel = useSim((s) => s.nivel)
  const planos = usePlanosCorte(radio)
  if (nivel <= 0) return null
  return (
    <mesh position={[0, nivel / 2, 0]} scale={[1, nivel, 1]}>
      <cylinderGeometry args={[radio, radio, 1, SEGMENTOS_CILINDRO]} />
      <meshStandardMaterial color={leerColor('--color-agua')} transparent opacity={OPACIDAD_AGUA} depthWrite={false} clippingPlanes={planos} />
    </mesh>
  )
}
