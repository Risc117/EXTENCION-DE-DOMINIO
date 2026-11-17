import { useMemo } from 'react'
import { Quaternion, Vector3 } from 'three'
import { OPACIDAD_ENTERRADO, SEGMENTOS_BUZON, SEGMENTOS_TUBO } from '../../nucleo/constantesConexiones'
import { leerColor } from '../../nucleo/colores'
import { useAnotaciones } from '../../estado/anotaciones'
import { useConexiones } from '../../estado/conexiones'
import { Etiqueta } from '../comun/Etiqueta'
import type { Vec3 } from '../comun/tiposAnotaciones'
import { construirEtiquetas } from './anotaciones'
import { conexiones } from './datos'
import { construirBuzones, construirFlechas, construirTramos, type SegmentoTubo } from './geometria'

const EJE_Y = new Vector3(0, 1, 0)

/** Giro que lleva el eje y de un cilindro o cono a la dirección dada. */
const giroHacia = (direccion: Vector3): Quaternion => new Quaternion().setFromUnitVectors(EJE_Y, direccion.clone().normalize())

function Tubo({ segmento, radio, color }: { segmento: SegmentoTubo; radio: number; color: string }) {
  const { posicion, giro, largo } = useMemo(() => {
    const [a, b] = [new Vector3(...segmento.a), new Vector3(...segmento.b)]
    return { posicion: a.clone().add(b).multiplyScalar(0.5), giro: giroHacia(b.clone().sub(a)), largo: a.distanceTo(b) }
  }, [segmento])
  return (
    <mesh position={posicion} quaternion={giro}>
      <cylinderGeometry args={[radio, radio, largo, SEGMENTOS_TUBO]} />
      <meshStandardMaterial color={color} transparent={segmento.enterrado} opacity={segmento.enterrado ? OPACIDAD_ENTERRADO : 1} depthWrite={!segmento.enterrado} />
    </mesh>
  )
}

/** Tuberías y buzones que conectan las estructuras (datos/conexiones.json), con su flecha de sentido y sus etiquetas. Los tramos enterrados se ven con transparencia. */
export function Conexiones({ referencia }: { referencia: number }) {
  const visibles = useConexiones((s) => s.visibles)
  const verEtiquetas = useAnotaciones((s) => s.etiquetas)
  const tubos = useMemo(() => construirTramos(conexiones, referencia), [referencia])
  const flechas = useMemo(() => construirFlechas(conexiones, referencia), [referencia])
  const buzones = useMemo(() => construirBuzones(conexiones, referencia), [referencia])
  const etiquetas = useMemo(() => construirEtiquetas(conexiones, referencia), [referencia])
  const colores = useMemo(() => new Map([...new Set([...tubos.map((t) => t.color), '--color-muro'])].map((c) => [c, leerColor(c)])), [tubos])
  if (!visibles) return null
  return (
    <group>
      {tubos.flatMap((t) => t.segmentos.map((s, i) => <Tubo key={`${t.id}-${i}`} segmento={s} radio={t.radio} color={colores.get(t.color)!} />))}
      {flechas.map((f) => (
        <mesh key={f.id} position={f.pos as Vec3} quaternion={giroHacia(new Vector3(...f.direccion))}>
          <coneGeometry args={[f.radio, f.largo, SEGMENTOS_TUBO]} />
          <meshStandardMaterial color={colores.get(f.color)!} />
        </mesh>
      ))}
      {buzones.map((b) => (
        <mesh key={b.id} position={b.pos}>
          <cylinderGeometry args={[b.radio, b.radio, b.alto, SEGMENTOS_BUZON]} />
          <meshStandardMaterial color={colores.get('--color-muro')!} />
        </mesh>
      ))}
      {verEtiquetas && etiquetas.map((e) => <Etiqueta key={e.id} etiqueta={e} />)}
    </group>
  )
}
