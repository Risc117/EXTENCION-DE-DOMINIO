import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three'
import { leerColor } from '../../nucleo/colores'
import { INTENSIDAD_PERLA_BIOGAS, PERLAS_BIOGAS, RADIO_PERLA_RELATIVO, SEGMENTOS_BIOGAS, TOPE_CUADRO_PERLAS_S, VELOCIDAD_PERLAS_BIOGAS } from '../../nucleo/constantesBiogas'
import { useLodosBiogas } from '../../estado/lodosBiogas'
import { useSim } from '../../estado/simulacion'
import { alturaTerreno } from '../comun/terrenoPlanta'
import { biogas } from './datos'
import { escalaLlama, perlasBiogas, rutaBiogas } from './geometria'

const EJE_Y = new Vector3(0, 1, 0)
/** Línea de biogás del RAFA a la antorcha: tubo amarillo con perlas que corren más rápido cuanto más biogás se produce. */
export function LineaBiogas({ referencia }: { referencia: number }) {
  const l = biogas.linea
  const radio = l.diametro.valor / 2
  const color = useMemo(() => leerColor('--color-tub-biogas'), [])
  const ruta = useMemo(() => rutaBiogas(l.trazado, alturaTerreno, referencia, l.alturaSobreTerreno.valor), [l, referencia])
  const tramos = useMemo(
    () =>
      ruta.puntos.slice(1).map((b, i) => {
        const [a, p] = [new Vector3(...ruta.puntos[i]), new Vector3(...b)]
        return { posicion: a.clone().add(p).multiplyScalar(0.5), giro: new Quaternion().setFromUnitVectors(EJE_Y, p.clone().sub(a).normalize()), largo: a.distanceTo(p) }
      }),
    [ruta],
  )
  const perlas = useRef<InstancedMesh>(null)
  const avance = useRef(0)
  const matriz = useMemo(() => new Matrix4(), [])
  useFrame((_, dt) => {
    const m = perlas.current
    if (!m) return
    const { produccion, datos } = useLodosBiogas.getState()
    const escala = produccion && datos ? escalaLlama(produccion.biogasM3h, datos.biogasDisenoM3h) : 0
    if (useSim.getState().corriendo) avance.current += VELOCIDAD_PERLAS_BIOGAS * escala * Math.min(dt, TOPE_CUADRO_PERLAS_S)
    perlasBiogas(ruta, avance.current, PERLAS_BIOGAS).forEach(([x, y, z], i) => m.setMatrixAt(i, matriz.makeTranslation(x, y, z)))
    m.instanceMatrix.needsUpdate = true
  })
  return (
    <group>
      {tramos.map((t, i) => (
        <mesh key={i} position={t.posicion} quaternion={t.giro}>
          <cylinderGeometry args={[radio, radio, t.largo, SEGMENTOS_BIOGAS]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      <instancedMesh ref={perlas} args={[undefined, undefined, PERLAS_BIOGAS]} frustumCulled={false}>
        <sphereGeometry args={[radio * RADIO_PERLA_RELATIVO, SEGMENTOS_BIOGAS, SEGMENTOS_BIOGAS]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={INTENSIDAD_PERLA_BIOGAS} />
      </instancedMesh>
    </group>
  )
}
