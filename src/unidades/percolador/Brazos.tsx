import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import escala from '../../../datos/escalaCaudal.json'
import { SEGMENTOS_CILINDRO } from '../../nucleo/constantes'
import { leerColor } from '../../nucleo/colores'
import { useSim } from '../../estado/simulacion'
import { usePlanosCorte } from '../comun/usePlanosCorte'
import { disponer } from './disposicion'
import type { DatosPercolador } from './esquema'
import { construirBrazos } from './geometria'
import { velocidadGiro } from './hidraulica'

const CAUDAL_PROMEDIO = escala.caudalPromedio.valor

/** Brazos del distribuidor rotatorio: giran más rápido o más lento según el caudal de la simulación (y paran con la simulación). */
export function Brazos({ datos }: { datos: DatosPercolador }) {
  const grupo = useRef<Group>(null)
  const brazos = useMemo(() => construirBrazos(datos), [datos])
  const color = useMemo(() => leerColor('--color-impulsion'), [])
  const planos = usePlanosCorte(disponer(datos).radioExterior)

  useFrame((_, dt) => {
    const sim = useSim.getState()
    if (grupo.current && sim.corriendo) grupo.current.rotation.y += velocidadGiro(datos, sim.caudalEntrada, CAUDAL_PROMEDIO) * dt
  })

  return (
    <group ref={grupo}>
      {brazos.map((b) => (
        <mesh key={b.id} position={b.pos} rotation={[0, b.giroY ?? 0, Math.PI / 2]}>
          <cylinderGeometry args={[b.radio, b.radio, b.alto, SEGMENTOS_CILINDRO]} />
          <meshStandardMaterial color={color} clippingPlanes={planos} />
        </mesh>
      ))}
    </group>
  )
}
