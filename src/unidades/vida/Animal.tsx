import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Box3, Vector3, type Group } from 'three'
import { clone as clonarPiel } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { ALETEO_AMPLITUD, ALETEO_FRECUENCIA, RUTA_MODELOS } from '../../nucleo/constantesVida'
import { alturaNivelada } from '../entorno/terrenoNivelado'
import type { Pose } from './reparto'

interface Props {
  /** Archivo .glb de public/modelos/. */
  modelo: string
  /** Dimensión mayor del animal (m): el modelo se escala a ella. */
  tamano: number
  /** Parte final del nombre de la animación que se reproduce (por ejemplo "Walk"); sin ella el modelo queda quieto. */
  animacion?: string
  /** Pose (plano x este, y norte, rumbo) en el instante t; null = quieto en la última pose. */
  pose: (t: number) => Pose
  /** Metros sobre el suelo; 0 = pisa el terreno nivelado. */
  altura?: number
  /** true = el animal se balancea de lado como si aleteara (para el modelo sin animaciones). */
  aletea?: boolean
  referencia: number
}

const [CAJA, TAMANO, CENTRO] = [new Box3(), new Vector3(), new Vector3()]

/** Coloca el animal en su pose: sobre el terreno (o a `altura`), de frente hacia donde va; si aletea, se balancea de lado. */
function colocar(g: Group, p: Pose, suelo: number, t: number, aletea: boolean): void {
  g.position.set(p.x, suelo, -p.y)
  g.rotation.set(0, p.rumbo + Math.PI / 2, aletea ? ALETEO_AMPLITUD * Math.sin(2 * Math.PI * ALETEO_FRECUENCIA * t) : 0)
}

/** Animal de un modelo .glb CC0: se escala a su tamaño, apoya los pies en el suelo y camina o vuela por su pose. */
export function Animal({ modelo, tamano, animacion, pose, altura = 0, aletea = false, referencia }: Props) {
  const { scene, animations } = useGLTF(RUTA_MODELOS + modelo)
  const clon = useMemo(() => clonarPiel(scene), [scene])
  const medida = useMemo(() => {
    clon.updateMatrixWorld(true)
    CAJA.setFromObject(clon, true).getSize(TAMANO)
    CAJA.getCenter(CENTRO)
    const k = tamano / (Math.max(TAMANO.x, TAMANO.y, TAMANO.z) || 1)
    return { escala: k, base: -CAJA.min.y * k, centroX: -CENTRO.x * k, centroZ: -CENTRO.z * k }
  }, [clon, tamano])
  const grupo = useRef<Group>(null)
  const interior = useRef<Group>(null)
  const { actions, names } = useAnimations(animations, interior)
  useEffect(() => {
    const nombre = animacion ? names.find((n) => n.endsWith(animacion)) : undefined
    const accion = nombre ? actions[nombre] : null
    accion?.reset().play()
    return () => void accion?.stop()
  }, [actions, names, animacion])
  useFrame(({ clock }) => {
    const p = pose(clock.elapsedTime)
    if (grupo.current) colocar(grupo.current, p, alturaNivelada(p.x, p.y) - referencia + altura, clock.elapsedTime, aletea)
  })
  return (
    <group ref={grupo}>
      <group ref={interior} scale={medida.escala} position={[medida.centroX, medida.base, medida.centroZ]}>
        <primitive object={clon} />
      </group>
    </group>
  )
}
