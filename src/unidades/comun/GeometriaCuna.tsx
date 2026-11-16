import { useMemo } from 'react'
import { ExtrudeGeometry, Shape } from 'three'

interface Props {
  x0: number
  x1: number
  ancho0: number
  ancho1: number
}

/** Trapecio visto desde arriba (ancho0 en x0, ancho1 en x1), estirado 1 m hacia arriba desde y = 0; se escala en y para darle altura. */
export function GeometriaCuna({ x0, x1, ancho0, ancho1 }: Props) {
  const geometria = useMemo(() => {
    const forma = new Shape()
    forma.moveTo(x0, -ancho0 / 2)
    forma.lineTo(x1, -ancho1 / 2)
    forma.lineTo(x1, ancho1 / 2)
    forma.lineTo(x0, ancho0 / 2)
    forma.closePath()
    const g = new ExtrudeGeometry(forma, { depth: 1, bevelEnabled: false })
    g.rotateX(-Math.PI / 2)
    return g
  }, [x0, x1, ancho0, ancho1])
  return <primitive object={geometria} attach="geometry" />
}
