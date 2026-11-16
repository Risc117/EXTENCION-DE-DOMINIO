import { useMemo, type ReactNode } from 'react'
import { DoubleSide, FrontSide, type Plane } from 'three'
import { SEGMENTOS_CILINDRO } from '../../nucleo/constantes'
import { OPACIDAD_AGUA_CANAL } from '../../nucleo/constantesCanales'
import { leerColor } from '../../nucleo/colores'
import { useAccesorios } from '../../estado/accesorios'
import { useAnotaciones } from '../../estado/anotaciones'
import { Cota } from './Cotas'
import { Etiqueta } from './Etiqueta'
import type { CotaCalculada, EtiquetaCalculada } from './tiposAnotaciones'
import { GeometriaAnillo } from './Anillo'
import { GeometriaCuna } from './GeometriaCuna'
import { GeometriaPrisma } from './GeometriaPrisma'
import { usePlanosCorte } from './usePlanosCorte'
import type { Agua, Inclinacion, Pieza } from './tipos'

interface Props {
  piezas: Pieza[]
  aguas: Agua[]
  cotas: CotaCalculada[]
  etiquetas: EtiquetaCalculada[]
  /** Semiancho (m) de la unidad en el sentido del corte: el plano del corte se mueve entre -radio y +radio. */
  radioCorte: number
}

/** Grupo que gira alrededor de z en su pivote; sin inclinación deja pasar a los hijos tal cual. */
function Inclinada({ inclinacion, children }: { inclinacion?: Inclinacion; children: ReactNode }) {
  if (!inclinacion) return <>{children}</>
  return (
    <group position={[inclinacion.pivote[0], inclinacion.pivote[1], 0]} rotation={[0, 0, inclinacion.angulo]}>
      {children}
    </group>
  )
}

/** Posición dentro del grupo inclinado: relativa al pivote. */
const relativa = (pos: [number, number, number], inc?: Inclinacion): [number, number, number] => (inc ? [pos[0] - inc.pivote[0], pos[1] - inc.pivote[1], pos[2]] : pos)

function MallaPieza({ pieza, planos }: { pieza: Pieza; planos: Plane[] }) {
  const color = useMemo(() => leerColor(pieza.color), [pieza.color])
  const opacidad = pieza.opacidad
  const acostado = pieza.forma === 'cilindro' ? pieza.eje : undefined
  const rotacion: [number, number, number] =
    acostado === 'x' ? [0, pieza.giroY ?? 0, Math.PI / 2] : acostado === 'z' ? [Math.PI / 2, pieza.giroY ?? 0, 0] : [pieza.giroX ?? 0, pieza.giroY ?? 0, pieza.giroZ ?? 0]
  return (
    <Inclinada inclinacion={pieza.inclinacion}>
    <mesh position={relativa(pieza.pos, pieza.inclinacion)} rotation={rotacion}>
      {pieza.forma === 'caja' && <boxGeometry args={pieza.tam} />}
      {pieza.forma === 'cilindro' && <cylinderGeometry args={[pieza.radio, pieza.radio, pieza.alto, SEGMENTOS_CILINDRO]} />}
      {pieza.forma === 'anillo' && <GeometriaAnillo radioInterior={pieza.radioInterior} radioExterior={pieza.radioExterior} alto={pieza.alto} />}
      {pieza.forma === 'cono' && <cylinderGeometry args={[pieza.radioSuperior, pieza.radioInferior, pieza.alto, SEGMENTOS_CILINDRO, 1, pieza.abierto === true]} />}
      {pieza.forma === 'prisma' && <GeometriaPrisma largo={pieza.largo} anchoSuperior={pieza.anchoSuperior} anchoInferior={pieza.anchoInferior} alto={pieza.alto} />}
      <meshStandardMaterial color={color} transparent={opacidad !== undefined} opacity={opacidad ?? 1} depthWrite={opacidad === undefined} clippingPlanes={planos} side={pieza.forma === 'cono' && pieza.abierto ? DoubleSide : FrontSide} />
    </mesh>
    </Inclinada>
  )
}

function MallaAgua({ agua, planos }: { agua: Agua; planos: Plane[] }) {
  const color = useMemo(() => leerColor('--color-agua'), [])
  if (agua.nivel <= 0) return null
  if (agua.forma === 'cuna') {
    return (
      <mesh position={[0, agua.y0, 0]} scale={[1, agua.nivel, 1]}>
        <GeometriaCuna x0={agua.x0} x1={agua.x1} ancho0={agua.ancho0} ancho1={agua.ancho1} />
        <meshStandardMaterial color={color} transparent opacity={OPACIDAD_AGUA_CANAL} depthWrite={false} clippingPlanes={planos} />
      </mesh>
    )
  }
  if (agua.forma === 'anillo') {
    return (
      <mesh position={[0, agua.y0, 0]} scale={[1, agua.nivel, 1]}>
        <GeometriaAnillo radioInterior={agua.radioInterior} radioExterior={agua.radioExterior} alto={1} />
        <meshStandardMaterial color={color} transparent opacity={OPACIDAD_AGUA_CANAL} depthWrite={false} clippingPlanes={planos} />
      </mesh>
    )
  }
  const y = agua.y0 + agua.nivel / 2
  const inc = agua.forma === 'caja' ? agua.inclinacion : undefined
  return (
    <Inclinada inclinacion={inc}>
    <mesh position={relativa([agua.centro[0], y, agua.centro[1]], inc)} scale={[1, agua.nivel, 1]}>
      {agua.forma === 'caja' ? <boxGeometry args={[agua.largo, 1, agua.ancho]} /> : <cylinderGeometry args={[agua.radio, agua.radio, 1, SEGMENTOS_CILINDRO]} />}
      <meshStandardMaterial color={color} transparent opacity={OPACIDAD_AGUA_CANAL} depthWrite={false} clippingPlanes={planos} />
    </mesh>
    </Inclinada>
  )
}

/** Dibuja una estructura armada con piezas simples: sus paredes, el agua, y las cotas y etiquetas con sus interruptores. */
export function Estructura({ piezas, aguas, cotas, etiquetas, radioCorte }: Props) {
  const planos = usePlanosCorte(radioCorte)
  const verAccesorios = useAccesorios((s) => s.visibles)
  const verCotas = useAnotaciones((s) => s.cotas)
  const verEtiquetas = useAnotaciones((s) => s.etiquetas)
  return (
    <group>
      {piezas.filter((p) => verAccesorios || !p.accesorio).map((p) => (
        <MallaPieza key={p.id} pieza={p} planos={planos} />
      ))}
      {aguas.map((a) => (
        <MallaAgua key={a.id} agua={a} planos={planos} />
      ))}
      {verCotas && cotas.map((c) => <Cota key={c.id} cota={c} />)}
      {verEtiquetas && etiquetas.map((e) => <Etiqueta key={e.id} etiqueta={e} />)}
    </group>
  )
}
