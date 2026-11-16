import { useMemo } from 'react'
import { ExtrudeGeometry, Path, Shape } from 'three'
import { SEGMENTOS_CILINDRO } from '../../nucleo/constantes'

interface Props {
  radioInterior: number
  radioExterior: number
  alto: number
}

/** Pared circular con espesor: un círculo exterior con un hueco, estirado hacia arriba. */
export function GeometriaAnillo({ radioInterior, radioExterior, alto }: Props) {
  const geometria = useMemo(() => {
    const forma = new Shape()
    forma.absarc(0, 0, radioExterior, 0, Math.PI * 2, false)
    const hueco = new Path()
    hueco.absarc(0, 0, radioInterior, 0, Math.PI * 2, true)
    forma.holes.push(hueco)
    const g = new ExtrudeGeometry(forma, { depth: alto, bevelEnabled: false, curveSegments: SEGMENTOS_CILINDRO * 2 })
    g.rotateX(-Math.PI / 2)
    return g
  }, [radioInterior, radioExterior, alto])
  return <primitive object={geometria} attach="geometry" />
}
