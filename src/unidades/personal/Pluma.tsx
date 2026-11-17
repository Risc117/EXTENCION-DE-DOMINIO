import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Group, Quaternion, Vector3 } from 'three'
import { leerColor } from '../../nucleo/colores'
import { GROSOR_PLUMA } from '../../nucleo/constantesEntorno'
import { GRADOS_MEDIA_VUELTA } from '../../nucleo/constantesViento'
import { useEntorno } from '../../estado/entorno'
import { usePersonal } from '../../estado/personal'
import { entorno } from '../entorno/datos'
import { alturaNivelada } from '../entorno/terrenoNivelado'
import { rutas } from './datos'
import { anguloPluma } from './horario'

const [EJE_X, ARRIBA] = [new Vector3(1, 0, 0), new Vector3(0, 1, 0)]
const GRADOS = Math.PI / GRADOS_MEDIA_VUELTA

/** Levanta o baja la pluma alrededor de su pivote: el eje es perpendicular a ella y horizontal. */
function girarPluma(g: Group, eje: Vector3, grados: number): void {
  g.quaternion.setFromAxisAngle(eje, grados * GRADOS)
}

/** Barrera de la garita (datos/entorno.json): una pluma que sube cuando un vehículo se acerca y baja cuando se aleja. */
export function Pluma({ referencia }: { referencia: number }) {
  const { desde, hasta, altura } = entorno.barrera
  const color = useMemo(() => leerColor('--color-barrera'), [])
  const { pivote, largo, alineacion, eje, medio } = useMemo(() => {
    const [a, b] = [new Vector3(desde.x, 0, -desde.y), new Vector3(hasta.x, 0, -hasta.y)]
    const d = b.clone().sub(a)
    const suelo = alturaNivelada(desde.x, desde.y) - referencia
    return { pivote: new Vector3(a.x, suelo + altura.valor, a.z), largo: d.length(), alineacion: new Quaternion().setFromUnitVectors(EJE_X, d.clone().normalize()), eje: d.clone().normalize().cross(ARRIBA).normalize(), medio: d.clone().multiplyScalar(0.5) }
  }, [desde, hasta, altura, referencia])
  const visible = useEntorno((s) => s.visible)
  const grupo = useRef<Group>(null)
  const angulo = useRef(0)
  useFrame((_, dt) => {
    const b = rutas.barrera
    angulo.current = anguloPluma(angulo.current, usePersonal.getState().barreraAbierta, dt, b.anguloAbierta.valor, b.rapidez.valor)
    if (grupo.current) girarPluma(grupo.current, eje, angulo.current)
  })
  if (!visible) return null
  return (
    <group position={pivote} ref={grupo}>
      <mesh position={medio} quaternion={alineacion}>
        <boxGeometry args={[largo, GROSOR_PLUMA, GROSOR_PLUMA]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}
