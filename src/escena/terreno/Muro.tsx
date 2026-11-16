import { useEffect, useMemo } from 'react'
import { BufferAttribute, BufferGeometry, DoubleSide } from 'three'
import { leerColor } from '../../nucleo/colores'
import { ENTERRADO_MURO, TRAMO_MURO, terreno } from '../../nucleo/terreno'
import { geometriaMuro } from './geometriaMuro'
import { superficieTerreno } from './superficie'

/** Muro de contención de la planta: trazo y espesor del plano; la altura es de ejemplo. */
export function Muro({ referencia }: { referencia: number }) {
  const color = useMemo(() => leerColor('--color-muro-contencion'), [])
  const geometria = useMemo(() => {
    const m = terreno.muro
    const d = geometriaMuro(m.trazo, superficieTerreno(), referencia, m.espesor.valor, m.altura.valor, ENTERRADO_MURO, TRAMO_MURO)
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(d.posiciones, 3))
    g.setIndex(new BufferAttribute(d.indices, 1))
    g.computeVertexNormals()
    return g
  }, [referencia])
  useEffect(() => () => geometria.dispose(), [geometria])
  return (
    <mesh geometry={geometria}>
      <meshStandardMaterial color={color} side={DoubleSide} />
    </mesh>
  )
}
