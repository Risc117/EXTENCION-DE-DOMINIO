import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AMORTIGUACION_CAMARA, OBJETIVO_CAMARA } from '../nucleo/constantes'
import { useEstado } from '../estado/almacen'

/** Pone la cámara en órbita según el estado, acercándose al destino con suavidad. No sabe quién la mueve. */
export function ControlCamara({ tamano }: { tamano: number }) {
  const actual = useRef({ ...useEstado.getState().camara })

  useFrame(({ camera }, delta) => {
    const meta = useEstado.getState().camara
    const k = 1 - Math.exp(-AMORTIGUACION_CAMARA * delta)
    const a = actual.current
    a.acimut += (meta.acimut - a.acimut) * k
    a.elevacion += (meta.elevacion - a.elevacion) * k
    a.distancia += (meta.distancia - a.distancia) * k

    const radio = a.distancia * tamano
    const [ox, oy, oz] = OBJETIVO_CAMARA
    camera.position.set(
      ox + radio * Math.cos(a.elevacion) * Math.sin(a.acimut),
      oy + radio * Math.sin(a.elevacion),
      oz + radio * Math.cos(a.elevacion) * Math.cos(a.acimut),
    )
    camera.lookAt(ox, oy, oz)
  })

  return null
}
