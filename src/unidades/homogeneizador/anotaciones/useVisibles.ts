import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import { useCorte } from '../../../estado/flujo'
import { quedaCortado, tapaElTanque } from './visibilidad'
import type { Vec3 } from './tipos'

export interface Candidato {
  id: string
  /** Punto que se usa para decidir si se ve. */
  anclaje: Vec3
  /** true si el muro del tanque puede taparlo (piezas de afuera). */
  tapable: boolean
}

export interface LimitesTanque {
  radioExterior: number
  radioInterior: number
  yMin: number
  yMax: number
}

/**
 * Ids de los candidatos que se ven en este momento: los que el corte no quita y los que el tanque no tapa desde la cámara.
 * Se recalcula en cada cuadro, pero solo se vuelve a dibujar cuando cambia la lista.
 */
export function useVisibles(candidatos: Candidato[], limites: LimitesTanque, activo: boolean): Set<string> {
  const camara = useThree((s) => s.camera)
  const [clave, setClave] = useState('')
  const claveRef = useRef('')
  useFrame(() => {
    if (!activo) return
    const corte = useCorte.getState()
    const cam: Vec3 = [camara.position.x, camara.position.y, camara.position.z]
    const ids = candidatos
      .filter((c) => !quedaCortado(c.anclaje, corte.activo, corte.posicion, limites.radioInterior))
      .filter((c) => !c.tapable || !tapaElTanque(cam, c.anclaje, limites.radioExterior, limites.yMin, limites.yMax))
      .map((c) => c.id)
    const nueva = ids.join('|')
    if (nueva !== claveRef.current) {
      claveRef.current = nueva
      setClave(nueva)
    }
  })
  return useMemo(() => new Set(clave ? clave.split('|') : []), [clave])
}
