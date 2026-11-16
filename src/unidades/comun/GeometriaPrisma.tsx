import { useMemo } from 'react'
import { ExtrudeGeometry, Shape } from 'three'

interface Props {
  largo: number
  anchoSuperior: number
  anchoInferior: number
  alto: number
}

/** Prisma trapecio: la sección (ancho en z, alto en y) se estira a lo largo de x, centrado en x y en y (como las cajas). */
export function GeometriaPrisma({ largo, anchoSuperior, anchoInferior, alto }: Props) {
  const geometria = useMemo(() => {
    const forma = new Shape()
    forma.moveTo(-anchoInferior / 2, 0)
    forma.lineTo(anchoInferior / 2, 0)
    forma.lineTo(anchoSuperior / 2, alto)
    forma.lineTo(-anchoSuperior / 2, alto)
    forma.closePath()
    const g = new ExtrudeGeometry(forma, { depth: largo, bevelEnabled: false })
    g.rotateY(Math.PI / 2)
    g.translate(-largo / 2, -alto / 2, 0)
    return g
  }, [largo, anchoSuperior, anchoInferior, alto])
  return <primitive object={geometria} attach="geometry" />
}
