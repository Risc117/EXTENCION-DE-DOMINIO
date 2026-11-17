import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Box3, Matrix4, Mesh, Quaternion, Vector3, type InstancedMesh } from 'three'
import { azar } from '../../nucleo/azar'
import { CUADROS_MOSCAS, ESTIRAMIENTO_MOSCA_VERTICAL, MOSCA_DISPERSION, MOSCA_FRECUENCIA, MOSCA_ORBITA_RELATIVA, MOSCA_VUELTA_MINIMA, MOSCA_VUELTA_VARIACION, RUTA_MODELOS, SEMILLA_MOSCAS } from '../../nucleo/constantesVida'
import { useCalidad } from '../../estado/calidad'
import { alturaNivelada } from '../entorno/terrenoNivelado'
import { centroDe, vida } from './datos'

const [POSE, BASE, GIRO, UNO, POS, EJE_Y] = [new Matrix4(), new Matrix4(), new Quaternion(), new Vector3(1, 1, 1), new Vector3(), new Vector3(0, 1, 0)]
const DOS_PI = 2 * Math.PI

interface Vuelo {
  dx: number
  dy: number
  fase: number
  vuelta: number
}

/** Pone cada mosca en su órbita sobre el lecho: círculo con su propio centro, rapidez y fase, subiendo y bajando. */
function ponerMoscas(malla: InstancedMesh, vuelos: Vuelo[], centro: { x: number; y: number }, suelo: number, t: number): void {
  const { radio, altura, velocidad } = vida.mosca
  const orbita = radio.valor * MOSCA_ORBITA_RELATIVA
  vuelos.forEach((v, i) => {
    const a = (velocidad.valor * t * v.vuelta) / radio.valor + v.fase * DOS_PI
    const y = suelo + altura.valor * (1 + ESTIRAMIENTO_MOSCA_VERTICAL * Math.sin(MOSCA_FRECUENCIA * a))
    POS.set(centro.x + v.dx + orbita * Math.cos(a), y, -(centro.y + v.dy + orbita * Math.sin(a)))
    GIRO.setFromAxisAngle(EJE_Y, a)
    malla.setMatrixAt(i, POSE.compose(POS, GIRO, UNO).multiply(BASE))
  })
  malla.instanceMatrix.needsUpdate = true
}

/** Moscas sobre el lecho de secado: una malla con instancias del modelo .glb (menos moscas y menos cuadros en calidad baja). */
export function Moscas({ referencia }: { referencia: number }) {
  const { scene } = useGLTF(RUTA_MODELOS + vida.mosca.modelo)
  const calidad = useCalidad((s) => s.calidad)
  const n = vida.cantidades.moscas[calidad]
  const centro = useMemo(() => centroDe(vida.mosca.lecho), [])
  const suelo = alturaNivelada(centro.x, centro.y) - referencia
  const pieza = useMemo(() => {
    scene.updateMatrixWorld(true)
    const caja = new Box3().setFromObject(scene)
    const tam = caja.getSize(new Vector3())
    const k = vida.mosca.tamano.valor / (Math.max(tam.x, tam.y, tam.z) || 1)
    const c = caja.getCenter(new Vector3())
    let malla: Mesh | undefined
    scene.traverse((o) => {
      if (!malla && (o as Mesh).isMesh) malla = o as Mesh
    })
    BASE.makeScale(k, k, k).multiply(new Matrix4().makeTranslation(-c.x, -c.y, -c.z)).multiply(malla?.matrixWorld ?? new Matrix4())
    return malla
  }, [scene])
  const vuelos = useMemo<Vuelo[]>(() => {
    const sorteo = azar(SEMILLA_MOSCAS)
    return Array.from({ length: n }, () => ({ dx: (sorteo() - MOSCA_DISPERSION) * vida.mosca.radio.valor, dy: (sorteo() - MOSCA_DISPERSION) * vida.mosca.radio.valor, fase: sorteo(), vuelta: MOSCA_VUELTA_MINIMA + MOSCA_VUELTA_VARIACION * sorteo() }))
  }, [n])
  const malla = useRef<InstancedMesh>(null)
  const cuadro = useRef(0)
  useLayoutEffect(() => {
    if (malla.current) ponerMoscas(malla.current, vuelos, centro, suelo, 0)
  }, [vuelos, centro, suelo, pieza])
  useFrame(({ clock }) => {
    cuadro.current += 1
    if (malla.current && cuadro.current % CUADROS_MOSCAS[calidad] === 0) ponerMoscas(malla.current, vuelos, centro, suelo, clock.elapsedTime)
  })
  if (!pieza) return null
  return <instancedMesh key={n} ref={malla} args={[pieza.geometry, pieza.material, n]} frustumCulled={false} />
}
