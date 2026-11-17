import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { ConeGeometry, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three'
import { leerColor } from '../../nucleo/colores'
import { CUADROS_PASTO, PASTO_FRECUENCIA, PASTO_LADOS, PASTO_RADIO_RELATIVO, PASTO_RAD_POR_MS, PASTO_TOPE_INCLINACION } from '../../nucleo/constantesVida'
import { useCalidad } from '../../estado/calidad'
import { useViento } from '../../estado/viento'
import { entorno } from '../entorno/datos'
import { alturaNivelada } from '../entorno/terrenoNivelado'
import { vida } from './datos'
import { repartirPasto, type Hoja } from './reparto'

const [MATRIZ, GIRO, POSICION, ESCALA, EJE] = [new Matrix4(), new Quaternion(), new Vector3(), new Vector3(), new Vector3()]
const DOS_PI = 2 * Math.PI

/** Pone cada hoja en su sitio: inclinada hacia donde sopla el viento más un vaivén propio (cada hoja con su fase). */
function ponerHojas(malla: InstancedMesh, hojas: Hoja[], suelos: number[], t: number, velocidad: number, haciaX: number, haciaZ: number): void {
  const fuerza = Math.min(PASTO_TOPE_INCLINACION, velocidad * PASTO_RAD_POR_MS)
  EJE.set(haciaZ, 0, -haciaX)
  hojas.forEach((h, i) => {
    const angulo = fuerza * (1 + Math.sin(DOS_PI * (PASTO_FRECUENCIA * t + h.giro)))
    GIRO.setFromAxisAngle(EJE, angulo)
    malla.setMatrixAt(i, MATRIZ.compose(POSICION.set(h.x, suelos[i], -h.y), GIRO, ESCALA.set(h.escala, h.escala, h.escala)))
  })
  malla.instanceMatrix.needsUpdate = true
}

/** Pasto de la franja verde: hojas con instancias que se mueven con el viento (menos hojas y menos cuadros en calidad baja). */
export function Pasto({ referencia }: { referencia: number }) {
  const calidad = useCalidad((s) => s.calidad)
  const n = vida.cantidades.pasto[calidad]
  const hojas = useMemo(() => repartirPasto(vida.pasto.franja.puntos, entorno.cerco.trazos, n, vida.pasto.ancho.valor, vida.pasto.semilla.valor), [n])
  const suelos = useMemo(() => hojas.map((h) => alturaNivelada(h.x, h.y) - referencia), [hojas, referencia])
  const color = useMemo(() => leerColor('--color-pasto'), [])
  const geometria = useMemo(() => new ConeGeometry(vida.pasto.altura.valor * PASTO_RADIO_RELATIVO, vida.pasto.altura.valor, PASTO_LADOS).translate(0, vida.pasto.altura.valor / 2, 0), [])
  const malla = useRef<InstancedMesh>(null)
  const cuadro = useRef(0)
  useLayoutEffect(() => {
    if (malla.current) ponerHojas(malla.current, hojas, suelos, 0, 0, 0, -1)
  }, [hojas, suelos])
  useFrame(({ clock }) => {
    cuadro.current += 1
    if (!malla.current || cuadro.current % CUADROS_PASTO[calidad] !== 0) return
    const v = useViento.getState()
    ponerHojas(malla.current, hojas, suelos, clock.elapsedTime, v.velocidad, v.haciaX, v.haciaZ)
  })
  return (
    <instancedMesh key={n} ref={malla} args={[geometria, undefined, n]} frustumCulled={false}>
      <meshStandardMaterial color={color} />
    </instancedMesh>
  )
}
