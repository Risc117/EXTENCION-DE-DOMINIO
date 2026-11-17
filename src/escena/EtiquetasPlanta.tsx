import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import { PASO_DISTANCIA_ETIQUETAS } from '../nucleo/constantesEtiquetas'
import { useEstado } from '../estado/almacen'
import { useAnotaciones } from '../estado/anotaciones'
import { Etiqueta } from '../unidades/comun/Etiqueta'
import { unidades } from '../unidades/registro'
import { encuadre } from './encuadre'
import { itemsDePlanta } from './itemsPlanta'
import { etiquetasDelNivel, nivelEtiquetas, type NivelEtiquetas } from './nivelEtiquetas'

interface Vista {
  nivel: NivelEtiquetas
  /** Distancia de la cámara (m), redondeada a pasos para no redibujar a cada cuadro. */
  distancia: number
}

/** Etiquetas con flecha de toda la planta: las unidades de tratamiento desde lejos y, al acercarse, también los edificios; la flecha crece con la distancia. */
export function EtiquetasPlanta({ referencia }: { referencia: number }) {
  const activas = useAnotaciones((s) => s.etiquetas)
  const escala = useMemo(() => encuadre(unidades, null).escala, [])
  const [vista, fijarVista] = useState<Vista>({ nivel: 'lejos', distancia: 0 })
  const nivel = useRef<NivelEtiquetas>('lejos')
  const items = useMemo(() => itemsDePlanta(referencia), [referencia])
  useFrame(() => {
    const { camara, foco } = useEstado.getState()
    const nuevo = nivelEtiquetas(camara.distancia, foco, nivel.current)
    const distancia = Math.round((camara.distancia * escala) / PASO_DISTANCIA_ETIQUETAS) * PASO_DISTANCIA_ETIQUETAS
    if (nuevo !== nivel.current || distancia !== vista.distancia) {
      nivel.current = nuevo
      fijarVista({ nivel: nuevo, distancia })
    }
  })
  const etiquetas = useMemo(() => etiquetasDelNivel(items, vista.nivel, vista.distancia), [items, vista])
  if (!activas) return null
  return (
    <group>
      {etiquetas.map((e) => (
        <Etiqueta key={e.id} etiqueta={e} />
      ))}
    </group>
  )
}
