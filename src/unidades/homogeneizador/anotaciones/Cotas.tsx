import { Html, Line } from '@react-three/drei'
import { useMemo } from 'react'
import { CAPA_TEXTO_ANOTACION, GROSOR_LINEA_ANOTACION, LARGO_FLECHA, ORDEN_ANOTACIONES } from '../../../nucleo/constantes'
import { leerColor } from '../../../nucleo/colores'
import { Flecha } from './Flecha'
import type { CotaCalculada, Vec3 } from './tipos'

const resta = (p: Vec3, q: Vec3): Vec3 => [p[0] - q[0], p[1] - q[1], p[2] - q[2]]

/** Una cota: línea con flecha en cada extremo, líneas de extensión y el texto con su valor. */
export function Cota({ cota }: { cota: CotaCalculada }) {
  const { a, b, extensiones, centro, texto } = cota
  const color = useMemo(() => leerColor('--color-cota'), [])
  const segmentos = useMemo(() => [a, b, ...extensiones.flat()], [a, b, extensiones])
  const hacia = resta(b, a)
  const atras = resta(a, b)
  const largo = Math.min(LARGO_FLECHA, Math.hypot(...hacia) / 3)
  return (
    <group>
      <Line points={segmentos} segments color={color} lineWidth={GROSOR_LINEA_ANOTACION} depthTest={false} renderOrder={ORDEN_ANOTACIONES} />
      <Flecha punta={a} direccion={atras} largo={largo} color={color} />
      <Flecha punta={b} direccion={hacia} largo={largo} color={color} />
      <Html position={centro} center zIndexRange={CAPA_TEXTO_ANOTACION} className="anotacion anotacion--cota">
        {texto}
      </Html>
    </group>
  )
}
