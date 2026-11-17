import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { BufferGeometry, CanvasTexture, DoubleSide, Float32BufferAttribute, PlaneGeometry, RepeatWrapping, type Plane } from 'three'
import { leerColor } from '../../nucleo/colores'
import {
  CENTRO_RAYA,
  DESPLAZAMIENTO_RAYA,
  ELEVACION_RAYAS,
  FACTOR_RAYAS_MAXIMO,
  FACTOR_RAYAS_MINIMO,
  GROSOR_RAYA,
  LADO_TEXTURA_RAYAS,
  LARGO_PATRON_RAYAS,
  LARGO_RAYA_RELATIVO,
  NUMERO_RAYAS,
  OPACIDAD_RAYAS,
  TOPE_CUADRO_RAYAS,
  VELOCIDAD_RAYAS,
} from '../../nucleo/constantesGotas'
import { useSim } from '../../estado/simulacion'
import type { Agua } from './tipos'

type AguaConCorriente = Extract<Agua, { forma: 'caja' | 'cuna' }>

/** Textura de rayas claras sobre fondo transparente, alineadas con el flujo (eje u). */
function texturaRayas(): CanvasTexture {
  const lado = LADO_TEXTURA_RAYAS
  const lienzo = document.createElement('canvas')
  lienzo.width = lienzo.height = lado
  const c = lienzo.getContext('2d')!
  c.strokeStyle = leerColor('--color-rayas-agua')
  c.lineWidth = GROSOR_RAYA
  for (let i = 0; i < NUMERO_RAYAS; i++) {
    const y = ((i + CENTRO_RAYA) * lado) / NUMERO_RAYAS
    const x0 = (i * DESPLAZAMIENTO_RAYA) % lado
    c.beginPath()
    c.moveTo(x0, y)
    c.lineTo(x0 + lado * LARGO_RAYA_RELATIVO, y)
    c.stroke()
  }
  const t = new CanvasTexture(lienzo)
  t.wrapS = t.wrapT = RepeatWrapping
  return t
}

/** Superficie del agua (rectángulo o trapecio en planta, a y = 0) con la coordenada u de la textura repetida cada LARGO_PATRON_RAYAS. */
function geometriaSuperficie(a: AguaConCorriente): BufferGeometry {
  if (a.forma === 'caja') {
    const g = new PlaneGeometry(a.largo, a.ancho)
    g.rotateX(-Math.PI / 2)
    const uv = g.getAttribute('uv')
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (a.largo / LARGO_PATRON_RAYAS), uv.getY(i))
    return g
  }
  const largo = a.x1 - a.x0
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute([a.x0, 0, -a.ancho0 / 2, a.x1, 0, -a.ancho1 / 2, a.x1, 0, a.ancho1 / 2, a.x0, 0, a.ancho0 / 2], 3))
  g.setAttribute('uv', new Float32BufferAttribute([0, 0, largo / LARGO_PATRON_RAYAS, 0, largo / LARGO_PATRON_RAYAS, 1, 0, 1], 2))
  g.setIndex([0, 1, 2, 0, 2, 3])
  return g
}

/** Corre las rayas unos metros en el sentido del flujo. */
function desplazar(t: CanvasTexture, metros: number): void {
  t.offset.x = -metros / LARGO_PATRON_RAYAS
}

/** Rayas claras que corren sobre el agua en el sentido del flujo (marca `corriente` del agua); más rápidas con más caudal y quietas en pausa. */
export function RayasCorriente({ agua, planos }: { agua: AguaConCorriente; planos: Plane[] }) {
  const geometria = useMemo(() => geometriaSuperficie(agua), [agua])
  const textura = useMemo(() => texturaRayas(), [])
  const avance = useRef(0)
  const sentido = agua.corriente ?? 1
  useFrame((_, dt) => {
    const s = useSim.getState()
    if (!s.corriendo || s.caudalEntrada <= 0) return
    const factor = s.promedioDia > 0 ? Math.min(FACTOR_RAYAS_MAXIMO, Math.max(FACTOR_RAYAS_MINIMO, s.caudalEntrada / s.promedioDia)) : 1
    avance.current += VELOCIDAD_RAYAS * factor * Math.min(dt, TOPE_CUADRO_RAYAS)
    desplazar(textura, sentido * avance.current)
  })
  const [x, z] = agua.forma === 'caja' ? agua.centro : [0, 0]
  return (
    <mesh geometry={geometria} position={[x, agua.y0 + agua.nivel + ELEVACION_RAYAS, z]}>
      <meshBasicMaterial map={textura} transparent opacity={OPACIDAD_RAYAS} depthWrite={false} side={DoubleSide} clippingPlanes={planos} />
    </mesh>
  )
}
