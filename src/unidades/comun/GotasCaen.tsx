import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { InstancedMesh, Matrix4 } from 'three'
import { leerColor } from '../../nucleo/colores'
import { GOTAS_POR_PUNTO, OPACIDAD_GOTA, RADIO_GOTA, SEGMENTOS_GOTA, VELOCIDAD_GOTA } from '../../nucleo/constantesGotas'
import { useSim } from '../../estado/simulacion'
import { alturaGota, desfasePunto, fasesGotas } from './gotas'

interface Props {
  /** Puntos (x, z) de la unidad de donde cae agua. */
  puntos: { x: number; z: number }[]
  yArriba: number
  yAbajo: number
}

/** Gotas que caen desde cada punto mientras la simulación corre y hay caudal (ilustrativo). Una sola malla con instancias. */
export function GotasCaen({ puntos, yArriba, yAbajo }: Props) {
  const color = useMemo(() => leerColor('--color-agua'), [])
  const malla = useRef<InstancedMesh>(null)
  const tiempo = useRef(0)
  const matriz = useMemo(() => new Matrix4(), [])
  const fases = useMemo(() => fasesGotas(GOTAS_POR_PUNTO), [])
  const total = puntos.length * GOTAS_POR_PUNTO
  useFrame((_, dt) => {
    const m = malla.current
    if (!m) return
    const sim = useSim.getState()
    const cae = sim.corriendo && sim.caudalEntrada > 0
    m.visible = sim.caudalEntrada > 0
    if (cae) tiempo.current += dt
    puntos.forEach((p, i) => {
      // Cada punto parte de una fase distinta para que no caigan todos juntos.
      const desfase = desfasePunto(i)
      fases.forEach((f, j) => m.setMatrixAt(i * GOTAS_POR_PUNTO + j, matriz.makeTranslation(p.x, alturaGota((f + desfase) % 1, tiempo.current, VELOCIDAD_GOTA, yArriba, yAbajo), p.z)))
    })
    m.instanceMatrix.needsUpdate = true
  })
  if (total === 0) return null
  return (
    <instancedMesh ref={malla} args={[undefined, undefined, total]} frustumCulled={false}>
      <sphereGeometry args={[RADIO_GOTA, SEGMENTOS_GOTA, SEGMENTOS_GOTA]} />
      <meshStandardMaterial color={color} transparent opacity={OPACIDAD_GOTA} />
    </instancedMesh>
  )
}
