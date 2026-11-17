import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { PUBLICACION_VIENTO_S } from '../../nucleo/constantesViento'
import { direccionHacia, velocidadConRafaga } from '../../nucleo/viento'
import { useViento } from '../../estado/viento'
import { ambiente } from './datos'

/** Publica el viento (con su ráfaga en el tiempo) unas 5 veces por segundo para los efectos y el indicador. */
function publicarViento(t: number): void {
  const v = ambiente.viento
  const [x, z] = direccionHacia(v.direccion.valor, ambiente.giroNorte.valor)
  useViento.getState().publicar(velocidadConRafaga(v.velocidad.valor, v.rafaga.amplitud.valor, v.rafaga.periodo.valor, t), v.direccion.valor, x, z)
}

export function PublicarViento() {
  const espera = useRef(0)
  useFrame(({ clock }, dt) => {
    espera.current -= dt
    if (espera.current > 0) return
    espera.current = PUBLICACION_VIENTO_S
    publicarViento(clock.elapsedTime)
  })
  return null
}
