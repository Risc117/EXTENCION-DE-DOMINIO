import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three'
import { leerColor } from '../../nucleo/colores'
import { SEGMENTOS_ARBOL } from '../../nucleo/constantesEntorno'
import { ARBOL_BALANCEO_MAXIMO, ARBOL_INCLINACION_FIJA, ARBOL_RAD_POR_MS, FASE_ARBOL } from '../../nucleo/constantesViento'
import { balanceoArbol } from '../../nucleo/viento'
import { useCalidad } from '../../estado/calidad'
import { useViento } from '../../estado/viento'
import { alturaNivelada } from './terrenoNivelado'
import { entorno } from './datos'

const [MATRIZ, GIRO, POSICION, UNO, EJE_Y] = [new Matrix4(), new Quaternion(), new Vector3(), new Vector3(1, 1, 1), new Vector3(0, 1, 0)]

/** Pone la instancia `i` de una malla de árbol: la pieza (a `altura` m sobre el pie) girada `angulo` rad alrededor del pie, hacia donde sopla el viento. */
function colocar(malla: InstancedMesh, i: number, pie: [number, number, number], altura: number, angulo: number, haciaX: number, haciaZ: number): void {
  // Eje horizontal perpendicular al viento: inclina el eje y hacia donde sopla.
  GIRO.setFromAxisAngle(POSICION.set(haciaZ, 0, -haciaX), angulo)
  POSICION.copy(EJE_Y).multiplyScalar(altura).applyQuaternion(GIRO)
  POSICION.set(pie[0] + POSICION.x, pie[1] + POSICION.y, pie[2] + POSICION.z)
  malla.setMatrixAt(i, MATRIZ.compose(POSICION, GIRO, UNO))
}

/** Los árboles del plano (copa y tronco con las medidas del DXF) como dos mallas con instancias; se inclinan y se balancean con el viento (cada 2 cuadros en calidad baja). */
export function Arboles({ referencia }: { referencia: number }) {
  const [copa, tronco] = useMemo(() => ['--color-arbol-copa', '--color-arbol-tronco'].map(leerColor), [])
  const { radioCopa, radioTronco, alturaTronco, alturaTotal, posiciones } = entorno.arboles
  const [altTronco, altCopa] = [alturaTronco.valor, alturaTotal.valor - alturaTronco.valor]
  const troncos = useRef<InstancedMesh>(null)
  const copas = useRef<InstancedMesh>(null)
  const cuadro = useRef(0)
  const pies = useMemo(() => posiciones.map((p): [number, number, number] => [p.x, alturaNivelada(p.x, p.y) - referencia, -p.y]), [posiciones, referencia])
  const dibujar = (t: number) => {
    const v = useViento.getState()
    pies.forEach((pie, i) => {
      const inclinacion = Math.min(ARBOL_BALANCEO_MAXIMO, v.velocidad * ARBOL_RAD_POR_MS) * ARBOL_INCLINACION_FIJA
      const angulo = inclinacion + balanceoArbol(t, (i * FASE_ARBOL) % 1, v.velocidad)
      if (troncos.current) colocar(troncos.current, i, pie, altTronco / 2, angulo, v.haciaX, v.haciaZ)
      if (copas.current) colocar(copas.current, i, pie, altTronco + altCopa / 2, angulo, v.haciaX, v.haciaZ)
    })
    for (const r of [troncos, copas]) if (r.current) r.current.instanceMatrix.needsUpdate = true
  }
  useLayoutEffect(() => dibujar(0))
  useFrame(({ clock }) => {
    cuadro.current += 1
    if (useCalidad.getState().calidad === 'baja' && cuadro.current % 2 === 1) return
    dibujar(clock.elapsedTime)
  })
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
