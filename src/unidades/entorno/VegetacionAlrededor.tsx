import { useLayoutEffect, useMemo, useRef } from 'react'
import { ConeGeometry, CylinderGeometry, InstancedMesh, Matrix4, Quaternion, SphereGeometry, Vector3 } from 'three'
import { leerColor } from '../../nucleo/colores'
import { SEGMENTOS_ARBOL } from '../../nucleo/constantesEntorno'
import { useCalidad } from '../../estado/calidad'
import { useVegetacion } from '../../estado/vegetacion'
import { vegetacion as datos } from './datosVegetacion'
import { alturaNivelada } from './terrenoNivelado'
import { repartirVegetacion, restriccionesDeEntorno, type Planta } from './vegetacion'

const [MATRIZ, GIRO, POSICION, ESCALA, EJE_Y] = [new Matrix4(), new Quaternion(), new Vector3(), new Vector3(), new Vector3(0, 1, 0)]
const SEGMENTOS_PASTO = 4
const SEGMENTOS_ARBUSTO = 6
/** Lo que se parte una esfera para que parezca un arbusto: anillos de latitud. */
const ANILLOS_ARBUSTO = 4

/** Pone cada planta de una malla con instancias: a su altura sobre el terreno (más `elevacion`), girada y a su escala. */
function colocar(malla: InstancedMesh, plantas: Planta[], suelos: number[], elevacion: number): void {
  plantas.forEach((p, i) => {
    GIRO.setFromAxisAngle(EJE_Y, p.giro)
    malla.setMatrixAt(i, MATRIZ.compose(POSICION.set(p.x, suelos[i] + elevacion * p.escala, -p.y), GIRO, ESCALA.set(p.escala, p.escala, p.escala)))
  })
  malla.instanceMatrix.needsUpdate = true
}

/**
 * Vegetación de los alrededores: árboles, arbustos y pasto fuera del cerco, sobre el terreno recortado, sin tapar el río, el camino ni las unidades.
 * Todo con instancias (una malla por tipo) y menos plantas en calidad baja; sin movimiento para cuidar los cuadros por segundo.
 */
export function VegetacionAlrededor({ referencia }: { referencia: number }) {
  const visible = useVegetacion((s) => s.visible)
  const calidad = useCalidad((s) => s.calidad)
  const { arboles, arbustos, pasto } = datos
  const colores = useMemo(() => ['--color-arbol-copa', '--color-arbol-tronco', '--color-arbusto', '--color-pasto'].map(leerColor), [])
  const restricciones = useMemo(() => restriccionesDeEntorno(datos), [])
  const reparto = useMemo(() => {
    const [na, nb, np] = [arboles.cantidad[calidad], arbustos.cantidad[calidad], pasto.cantidad[calidad]]
    const hechos = [na, nb, np].map((n, k) => repartirVegetacion(restricciones, n, datos.semilla.valor + k, datos.variacionEscala.valor))
    return hechos.map((plantas) => ({ plantas, suelos: plantas.map((p) => alturaNivelada(p.x, p.y) - referencia) }))
  }, [restricciones, calidad, referencia, arboles.cantidad, arbustos.cantidad, pasto.cantidad])
  const [arbolesR, arbustosR, pastoR] = reparto
  const troncos = useRef<InstancedMesh>(null)
  const copas = useRef<InstancedMesh>(null)
  const matorral = useRef<InstancedMesh>(null)
  const matas = useRef<InstancedMesh>(null)
  const altTronco = arboles.alturaTronco.valor
  const altCopa = arboles.alturaTotal.valor - altTronco
  useLayoutEffect(() => {
    if (troncos.current) colocar(troncos.current, arbolesR.plantas, arbolesR.suelos, altTronco / 2)
    if (copas.current) colocar(copas.current, arbolesR.plantas, arbolesR.suelos, altTronco + altCopa / 2)
    if (matorral.current) colocar(matorral.current, arbustosR.plantas, arbustosR.suelos, arbustos.altura.valor / 2)
    if (matas.current) colocar(matas.current, pastoR.plantas, pastoR.suelos, pasto.altura.valor / 2)
  }, [visible, arbolesR, arbustosR, pastoR, altTronco, altCopa, arbustos.altura.valor, pasto.altura.valor])
  const geometrias = useMemo(
    () => ({
      tronco: new CylinderGeometry(arboles.radioTronco.valor, arboles.radioTronco.valor, altTronco, SEGMENTOS_ARBOL),
      copa: new ConeGeometry(arboles.radioCopa.valor, altCopa, SEGMENTOS_ARBOL),
      arbusto: new SphereGeometry(arbustos.radio.valor, SEGMENTOS_ARBUSTO, ANILLOS_ARBUSTO).scale(1, arbustos.altura.valor / (2 * arbustos.radio.valor), 1),
      mata: new ConeGeometry(pasto.radio.valor, pasto.altura.valor, SEGMENTOS_PASTO),
    }),
    [arboles.radioTronco, arboles.radioCopa, altTronco, altCopa, arbustos.radio, arbustos.altura, pasto.radio, pasto.altura],
  )
  if (!visible) return null
  return (
    <group>
      <instancedMesh key={`t${arbolesR.plantas.length}`} ref={troncos} args={[geometrias.tronco, undefined, arbolesR.plantas.length]} frustumCulled={false}>
        <meshStandardMaterial color={colores[1]} />
      </instancedMesh>
      <instancedMesh key={`c${arbolesR.plantas.length}`} ref={copas} args={[geometrias.copa, undefined, arbolesR.plantas.length]} frustumCulled={false}>
        <meshStandardMaterial color={colores[0]} />
      </instancedMesh>
      <instancedMesh key={`a${arbustosR.plantas.length}`} ref={matorral} args={[geometrias.arbusto, undefined, arbustosR.plantas.length]} frustumCulled={false}>
        <meshStandardMaterial color={colores[2]} />
      </instancedMesh>
      <instancedMesh key={`p${pastoR.plantas.length}`} ref={matas} args={[geometrias.mata, undefined, pastoR.plantas.length]} frustumCulled={false}>
        <meshStandardMaterial color={colores[3]} />
      </instancedMesh>
    </group>
  )
}
