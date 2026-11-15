import { Html } from '@react-three/drei'
import { useMemo } from 'react'
import { CAPA_TEXTO_ANOTACION, OPACIDAD_MARCADOR } from '../../nucleo/constantes'
import { leerColor } from '../../nucleo/colores'

interface Props {
  nombre: string
  largo: number
  ancho: number
  alto: number
}

/** Caja con el nombre de una unidad que todavía no está dibujada. */
export function Marcador({ nombre, largo, ancho, alto }: Props) {
  const color = useMemo(() => leerColor('--color-marcador'), [])
  return (
    <group>
      <mesh position={[0, alto / 2, 0]}>
        <boxGeometry args={[largo, alto, ancho]} />
        <meshStandardMaterial color={color} transparent opacity={OPACIDAD_MARCADOR} />
      </mesh>
      <Html position={[0, alto, 0]} center zIndexRange={CAPA_TEXTO_ANOTACION} className="anotacion anotacion--marcador">
        {nombre}
      </Html>
    </group>
  )
}
