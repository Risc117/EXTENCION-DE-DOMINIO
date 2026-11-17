import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Box3, Mesh, MeshStandardMaterial, Vector3, type AnimationAction, type Group } from 'three'
import { clone as clonarPiel } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { ALETEO_AMPLITUD, ALETEO_FRECUENCIA, DURACION_CAMBIO_ANIMACION, MATERIAL_FAROS, RUTA_MODELOS } from '../../nucleo/constantesVida'
import { alturaNivelada } from '../entorno/terrenoNivelado'
import type { Pose } from './rutaPlana'

interface Props {
  /** Archivo .glb de public/modelos/. */
  modelo: string
  /** Dimensión mayor del modelo (m): se escala a ella. */
  tamano: number
  /** Parte final del nombre de la animación que se reproduce (por ejemplo "Walk"); sin ella el modelo queda quieto. */
  animacion?: string
  /** Animación mientras la pose está `parada` (por ejemplo "Interact"); sin ella sigue con `animacion`. */
  animacionQuieto?: string
  /** Pose (plano x este, y norte, rumbo) en el instante t. */
  pose: (t: number) => Pose
  /** Metros sobre el suelo; 0 = pisa el terreno nivelado. */
  altura?: number
  /** true = se balancea de lado como si aleteara (modelo sin animaciones). */
  aletea?: boolean
  /** Brillo de los faros (material "Headlights" del modelo); 0 = apagados. */
  faros?: number
  referencia: number
}

const [CAJA, TAMANO, CENTRO] = [new Box3(), new Vector3(), new Vector3()]

/** Coloca el animal en su pose: sobre el terreno (o a `altura`), de frente hacia donde va; si aletea, se balancea de lado. */
function colocar(g: Group, p: Pose, suelo: number, t: number, aletea: boolean): void {
  g.visible = !p.oculto
  g.position.set(p.x, suelo, -p.y)
  g.rotation.set(0, p.rumbo + Math.PI / 2, aletea ? ALETEO_AMPLITUD * Math.sin(2 * Math.PI * ALETEO_FRECUENCIA * t) : 0)
}

/** Pasa de una animación a otra suavemente. */
function cambiar(de: AnimationAction | null, a: AnimationAction | null): void {
  de?.fadeOut(DURACION_CAMBIO_ANIMACION)
  a?.reset().fadeIn(DURACION_CAMBIO_ANIMACION).play()
}

/** Pone el brillo de los materiales de los faros (copias propias de este modelo). */
function encenderFaros(faros: MeshStandardMaterial[], brillo: number): void {
  for (const m of faros) m.emissiveIntensity = brillo
}

/** Animal, persona o vehículo de un modelo .glb CC0: se escala a su tamaño, apoya en el suelo y sigue su pose. */
export function Animal({ modelo, tamano, animacion, animacionQuieto, pose, altura = 0, aletea = false, faros = 0, referencia }: Props) {
  const { scene, animations } = useGLTF(RUTA_MODELOS + modelo)
  const { clon, luces } = useMemo(() => {
    const c = clonarPiel(scene)
    const l: MeshStandardMaterial[] = []
    c.traverse((o) => {
      const m = (o as Mesh).isMesh ? ((o as Mesh).material as MeshStandardMaterial) : null
      if (m?.name === MATERIAL_FAROS) {
        const propio = m.clone()
        propio.emissive.set(propio.color)
        ;(o as Mesh).material = propio
        l.push(propio)
      }
    })
    return { clon: c, luces: l }
  }, [scene])
  const medida = useMemo(() => {
    clon.updateMatrixWorld(true)
    CAJA.setFromObject(clon, true).getSize(TAMANO)
    CAJA.getCenter(CENTRO)
    const k = tamano / (Math.max(TAMANO.x, TAMANO.y, TAMANO.z) || 1)
    return { escala: k, base: -CAJA.min.y * k, centroX: -CENTRO.x * k, centroZ: -CENTRO.z * k }
  }, [clon, tamano])
  const grupo = useRef<Group>(null)
  const interior = useRef<Group>(null)
  const parado = useRef<boolean | null>(null)
  const { actions, names } = useAnimations(animations, interior)
  const accion = (fin?: string) => {
    const nombre = fin ? names.find((n) => n.endsWith(fin)) : undefined
    return nombre ? actions[nombre] : null
  }
  useEffect(() => {
    accion(animacion)?.reset().play()
    parado.current = false
    return () => void accion(animacion)?.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, names, animacion])
  useEffect(() => encenderFaros(luces, faros), [luces, faros])
  useFrame(({ clock }) => {
    const p = pose(clock.elapsedTime)
    if (grupo.current) colocar(grupo.current, p, alturaNivelada(p.x, p.y) - referencia + altura, clock.elapsedTime, aletea)
    const quieto = Boolean(p.parado) && Boolean(animacionQuieto)
    if (animacionQuieto && quieto !== parado.current) {
      cambiar(accion(quieto ? animacion : animacionQuieto), accion(quieto ? animacionQuieto : animacion))
      parado.current = quieto
    }
  })
  return (
    <group ref={grupo}>
      <group ref={interior} scale={medida.escala} position={[medida.centroX, medida.base, medida.centroZ]}>
        <primitive object={clon} />
      </group>
    </group>
  )
}
