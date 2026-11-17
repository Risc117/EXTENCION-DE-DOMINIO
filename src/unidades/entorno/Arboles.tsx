import { useLayoutEffect, useMemo, useRef } from 'react'
import { InstancedMesh, Matrix4 } from 'three'
import { leerColor } from '../../nucleo/colores'
import { SEGMENTOS_ARBOL } from '../../nucleo/constantesEntorno'
import { alturaNivelada } from './terrenoNivelado'
import { entorno } from './datos'

/** Los árboles del plano (copa y tronco con las medidas del DXF) como dos mallas con instancias. */
export function Arboles({ referencia }: { referencia: number }) {
  const [copa, tronco] = useMemo(() => ['--color-arbol-copa', '--color-arbol-tronco'].map(leerColor), [])
  const { radioCopa, radioTronco, alturaTronco, alturaTotal, posiciones } = entorno.arboles
  const [altTronco, altCopa] = [alturaTronco.valor, alturaTotal.valor - alturaTronco.valor]
  const troncos = useRef<InstancedMesh>(null)
  const copas = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = new Matrix4()
    posiciones.forEach((p, i) => {
      const suelo = alturaNivelada(p.x, p.y) - referencia
      troncos.current?.setMatrixAt(i, m.makeTranslation(p.x, suelo + altTronco / 2, -p.y))
      copas.current?.setMatrixAt(i, m.makeTranslation(p.x, suelo + altTronco + altCopa / 2, -p.y))
    })
    for (const r of [troncos, copas]) if (r.current) r.current.instanceMatrix.needsUpdate = true
  }, [posiciones, referencia, altTronco, altCopa])
  return (
    <group>
      <instancedMesh ref={troncos} args={[undefined, undefined, posiciones.length]}>
        <cylinderGeometry args={[radioTronco.valor, radioTronco.valor, altTronco, SEGMENTOS_ARBOL]} />
        <meshStandardMaterial color={tronco} />
      </instancedMesh>
      <instancedMesh ref={copas} args={[undefined, undefined, posiciones.length]}>
        <coneGeometry args={[radioCopa.valor, altCopa, SEGMENTOS_ARBOL]} />
        <meshStandardMaterial color={copa} />
      </instancedMesh>
    </group>
  )
}
