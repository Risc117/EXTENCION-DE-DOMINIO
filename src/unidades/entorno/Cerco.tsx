import { useMemo } from 'react'
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Quaternion, Vector3 } from 'three'
import { leerColor } from '../../nucleo/colores'
import { GROSOR_PLUMA, GROSOR_PORTON, OPACIDAD_CERCO, PASO_ENTORNO } from '../../nucleo/constantesEntorno'
import { alturaNivelada } from './terrenoNivelado'
import { entorno } from './datos'
import { panelVertical } from './geometria'

const EJE_X = new Vector3(1, 0, 0)

interface PropsBarra {
  desde: { x: number; y: number }
  hasta: { x: number; y: number }
  /** Altura (m) del borde alto sobre el terreno. */
  alto: number
  grosor: number
  color: string
  referencia: number
}

/** Caja delgada entre dos puntos del plano, de la altura dada: la pluma de la barrera y las hojas del portón. */
function Barra({ desde, hasta, alto, grosor, color, referencia }: PropsBarra) {
  const { pos, giro, largo } = useMemo(() => {
    const [a, b] = [new Vector3(desde.x, 0, -desde.y), new Vector3(hasta.x, 0, -hasta.y)]
    const suelo = alturaNivelada((desde.x + hasta.x) / 2, (desde.y + hasta.y) / 2) - referencia
    const medio = a.clone().add(b).multiplyScalar(0.5)
    return { pos: new Vector3(medio.x, suelo + alto / 2, medio.z), giro: new Quaternion().setFromUnitVectors(EJE_X, b.clone().sub(a).normalize()), largo: a.distanceTo(b) }
  }, [desde, hasta, alto, referencia])
  return (
    <mesh position={pos} quaternion={giro}>
      <boxGeometry args={[largo, alto, grosor]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

/** Cerco perimétrico (malla que sigue el terreno), portón de 4.5 m con sus hojas cerradas y la barrera de la garita. */
export function Cerco({ referencia }: { referencia: number }) {
  const [cerco, porton, barrera] = useMemo(() => ['--color-cerco', '--color-porton', '--color-barrera'].map(leerColor), [])
  const paneles = useMemo(
    () =>
      entorno.cerco.trazos.map((t) => {
        const m = panelVertical(t, entorno.cerco.altura.valor, alturaNivelada, referencia, PASO_ENTORNO)
        const g = new BufferGeometry()
        g.setAttribute('position', new Float32BufferAttribute(m.posiciones, 3))
        g.setIndex(m.indices)
        return g
      }),
    [referencia],
  )
  return (
    <group>
      {paneles.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color={cerco} side={DoubleSide} transparent opacity={OPACIDAD_CERCO} depthWrite={false} />
        </mesh>
      ))}
      {entorno.cerco.portones.map((p) => (
        <Barra key={p.id} desde={p.desde} hasta={p.hasta} alto={p.altura.valor} grosor={GROSOR_PORTON} color={porton} referencia={referencia} />
      ))}
      <Barra desde={entorno.barrera.desde} hasta={entorno.barrera.hasta} alto={entorno.barrera.altura.valor} grosor={GROSOR_PLUMA} color={barrera} referencia={referencia} />
    </group>
  )
}
