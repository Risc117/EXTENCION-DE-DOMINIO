import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Mesh } from 'three'
import { INTERVALO_SOMBRAS_S } from '../nucleo/constantesAmbiente'
import { useCalidad } from '../estado/calidad'

/** Marca de las mallas ya revisadas, para no volver a tocarlas. */
const REVISADA = 'sombraRevisada'

/**
 * Activa las sombras de las mallas de la escena (solo en calidad alta): las opacas proyectan y reciben; las transparentes (agua, cerco) solo reciben.
 * Las unidades se montan por separado, así que se revisa la escena cada INTERVALO_SOMBRAS_S segundos y solo las mallas nuevas.
 */
export function Sombras() {
  const alta = useCalidad((s) => s.calidad === 'alta')
  const scene = useThree((s) => s.scene)
  const espera = useRef(0)
  useFrame((_, dt) => {
    espera.current -= dt
    if (!alta || espera.current > 0) return
    espera.current = INTERVALO_SOMBRAS_S
    scene.traverse((o) => {
      if (!(o instanceof Mesh) || o.userData[REVISADA]) return
      const material = Array.isArray(o.material) ? o.material[0] : o.material
      o.castShadow = !material?.transparent
      o.receiveShadow = true
      o.userData[REVISADA] = true
    })
  })
  return null
}
