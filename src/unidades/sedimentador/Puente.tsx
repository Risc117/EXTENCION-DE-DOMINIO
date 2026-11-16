import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { SEGMENTOS_CILINDRO } from '../../nucleo/constantes'
import { leerColor } from '../../nucleo/colores'
import { useSim } from '../../estado/simulacion'
import { usePlanosCorte } from '../comun/usePlanosCorte'
import { disponer } from './disposicion'
import type { DatosSedimentador } from './esquema'
import { construirPuente } from './geometria'
import { velocidadPuente } from './hidraulica'

/** Puente barrendero: gira alrededor del centro del tanque a la velocidad de ejemplo mientras la simulación corre. */
export function Puente({ datos }: { datos: DatosSedimentador }) {
  const grupo = useRef<Group>(null)
  const piezas = useMemo(() => construirPuente(datos), [datos])
  const color = useMemo(() => leerColor('--color-agitador'), [])
  const planos = usePlanosCorte(disponer(datos).radioCanalExterior)

  useFrame((_, dt) => {
    if (grupo.current && useSim.getState().corriendo) grupo.current.rotation.y += velocidadPuente(datos) * dt
  })

  return (
    <group ref={grupo}>
      {piezas.map((p) => (
        <mesh key={p.id} position={p.pos}>
          {p.forma === 'caja' && <boxGeometry args={p.tam} />}
          {p.forma === 'cilindro' && <cylinderGeometry args={[p.radio, p.radio, p.alto, SEGMENTOS_CILINDRO]} />}
          <meshStandardMaterial color={color} clippingPlanes={planos} />
        </mesh>
      ))}
    </group>
  )
}
