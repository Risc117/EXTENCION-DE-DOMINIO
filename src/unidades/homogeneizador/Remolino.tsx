import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { ESPIRAL, OPACIDAD_REMOLINO } from '../../nucleo/constantes'
import { leerColor } from '../../nucleo/colores'
import { useSim } from '../../estado/simulacion'
import { puntosEspiral } from '../comun/corte'
import { usePlanosCorte } from '../comun/usePlanosCorte'

interface Props {
  radioZona: number
  altura: number
  radioTanque: number
}

/** Espiral tenue alrededor del agitador que gira para mostrar el remolino. */
export function Remolino({ radioZona, altura, radioTanque }: Props) {
  const grupo = useRef<Group>(null)
  const nivel = useSim((s) => s.nivel)
  const puntos = useMemo(() => puntosEspiral(radioZona), [radioZona])
  const planos = usePlanosCorte(radioTanque)

  useFrame((_, dt) => {
    if (grupo.current && useSim.getState().corriendo) grupo.current.rotation.y += ESPIRAL.giro * dt
  })

  if (nivel <= altura) return null
  return (
    <group ref={grupo} position={[0, altura, 0]}>
      <Line points={puntos} color={leerColor('--color-remolino')} lineWidth={ESPIRAL.grosor} transparent opacity={OPACIDAD_REMOLINO} clippingPlanes={planos} />
    </group>
  )
}
