import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AMORTIGUACION_CAMARA } from '../nucleo/constantes'
import { useEstado } from '../estado/almacen'
import type { Unidad } from '../unidades/tipos'
import { encuadre } from './encuadre'

/** Pone la cámara en órbita según el estado, acercándose al destino con suavidad. No sabe quién la mueve. */
export function ControlCamara({ unidades }: { unidades: Unidad[] }) {
  const inicio = encuadre(unidades, useEstado.getState().foco)
  const actual = useRef({ ...useEstado.getState().camara, objetivo: [...inicio.objetivo], escala: inicio.escala })

  useFrame(({ camera }, delta) => {
    const estado = useEstado.getState()
    const meta = estado.camara
    const lugar = encuadre(unidades, estado.foco)
    const k = 1 - Math.exp(-AMORTIGUACION_CAMARA * delta)
    const a = actual.current
    a.acimut += (meta.acimut - a.acimut) * k
    a.elevacion += (meta.elevacion - a.elevacion) * k
    a.distancia += (meta.distancia - a.distancia) * k
    a.escala += (lugar.escala - a.escala) * k
    for (let i = 0; i < 3; i++) a.objetivo[i] += (lugar.objetivo[i] - a.objetivo[i]) * k

    const radio = a.distancia * a.escala
    const [ox, oy, oz] = a.objetivo
    camera.position.set(
      ox + radio * Math.cos(a.elevacion) * Math.sin(a.acimut),
      oy + radio * Math.sin(a.elevacion),
      oz + radio * Math.cos(a.elevacion) * Math.cos(a.acimut),
    )
    camera.lookAt(ox, oy, oz)
  })

  return null
}
