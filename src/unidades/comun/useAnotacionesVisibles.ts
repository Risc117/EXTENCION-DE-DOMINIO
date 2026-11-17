import { useFrame, useThree } from '@react-three/fiber'
import { useContext, useRef, useState } from 'react'
import { TAMANO_UNIDAD_SUPUESTO } from '../../nucleo/constantesVista'
import { useAnotaciones } from '../../estado/anotaciones'
import { ContextoUbicacion } from '../contextoUbicacion'
import { anotacionesVisibles, estaCerca } from './cercania'

/**
 * Qué cotas y etiquetas dibuja la unidad que lo llama: las que sus botones dejan y, salvo que se pida verlas de lejos,
 * solo mientras la cámara está cerca de ella. Solo vuelve a dibujar cuando cambia el estado.
 */
export function useAnotacionesVisibles(): { cotas: boolean; etiquetas: boolean } {
  const cotas = useAnotaciones((s) => s.cotas)
  const etiquetas = useAnotaciones((s) => s.etiquetas)
  const siempre = useAnotaciones((s) => s.siempre)
  const ubicacion = useContext(ContextoUbicacion)
  const camara = useThree((s) => s.camera)
  const [cerca, setCerca] = useState(false)
  const actual = useRef(false)
  useFrame(() => {
    const [x, y, z] = ubicacion.posicion
    const distancia = Math.hypot(camara.position.x - x, camara.position.y - y, camara.position.z - z)
    const ahora = estaCerca(distancia, ubicacion.tamano ?? TAMANO_UNIDAD_SUPUESTO, actual.current)
    if (ahora !== actual.current) {
      actual.current = ahora
      setCerca(ahora)
    }
  })
  return anotacionesVisibles({ cotas, etiquetas, siempre }, cerca)
}
