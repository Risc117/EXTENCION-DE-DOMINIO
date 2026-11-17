import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import { BufferGeometry, CanvasTexture, DoubleSide, Float32BufferAttribute, RepeatWrapping } from 'three'
import { leerColor } from '../../nucleo/colores'
import { ANCHO_MAXIMO_FRANJA, ELEVACION_RIO, LADO_TEXTURA_RIO, LARGO_PATRON_RIO, PASO_ENTORNO, RAYAS_RIO, VELOCIDAD_RIO } from '../../nucleo/constantesEntorno'
import { useSim } from '../../estado/simulacion'
import { alturaNivelada } from './terrenoNivelado'
import { entorno } from './datos'
import { cintaEntreMargenes } from './franjas'

/** Textura de agua: el color del río con rayas claras a lo largo de la corriente (una repetición = LARGO_PATRON_RIO m). */
function texturaAgua(): CanvasTexture {
  const lado = LADO_TEXTURA_RIO
  const lienzo = document.createElement('canvas')
  lienzo.width = lienzo.height = lado
  const c = lienzo.getContext('2d')!
  c.fillStyle = leerColor('--color-rio')
  c.fillRect(0, 0, lado, lado)
  c.strokeStyle = leerColor('--color-rio-espuma')
  c.lineWidth = 2
  for (let i = 0; i < RAYAS_RIO; i++) {
    const y = ((i * 37 + 11) % lado) + 0.5
    const x0 = (i * 23) % lado
    c.beginPath()
    c.moveTo(x0, y)
    c.lineTo(x0 + lado * 0.35, y)
    c.stroke()
  }
  const t = new CanvasTexture(lienzo)
  t.wrapS = t.wrapT = RepeatWrapping
  return t
}

/** Mueve la textura unos metros en el sentido de la corriente. */
function correr(t: CanvasTexture, metros: number): void {
  t.offset.x -= metros / LARGO_PATRON_RIO
}

/** Río Picoy: cinta de agua entre sus dos orillas del DXF, con una textura que corre en el sentido de la corriente (ilustrativo). */
export function Rio({ referencia }: { referencia: number }) {
  const geometria = useMemo(() => {
    const m = cintaEntreMargenes(entorno.rio.margenesA, entorno.rio.margenB, PASO_ENTORNO, alturaNivelada, referencia, ELEVACION_RIO, LARGO_PATRON_RIO, ANCHO_MAXIMO_FRANJA)
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(m.posiciones, 3))
    g.setAttribute('uv', new Float32BufferAttribute(m.uv, 2))
    g.setIndex(m.indices)
    g.computeVertexNormals()
    return g
  }, [referencia])
  const textura = useMemo(() => texturaAgua(), [])
  const sentido = entorno.rio.sentido.valor === 'primero-al-ultimo' ? 1 : -1
  useFrame((_, dt) => {
    if (useSim.getState().corriendo) correr(textura, sentido * VELOCIDAD_RIO * Math.min(dt, 0.1))
  })
  return (
    <mesh geometry={geometria}>
      <meshStandardMaterial map={textura} side={DoubleSide} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  )
}
