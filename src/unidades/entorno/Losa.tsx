import { useMemo } from 'react'
import { ExtrudeGeometry, Shape, Vector2 } from 'three'
import type { PuntoPlano } from './esquema'

/** Prisma vertical sobre un polígono del plano: de `base` a `base + alto` (alturas ya en la escena). */
export function Losa({ poligono, base, alto, color }: { poligono: PuntoPlano[]; base: number; alto: number; color: string }) {
  const geometria = useMemo(() => new ExtrudeGeometry(new Shape(poligono.map((p) => new Vector2(p.x, p.y))), { depth: alto, bevelEnabled: false }), [poligono, alto])
  return (
    <mesh geometry={geometria} position={[0, base, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
