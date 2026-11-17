import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Matrix4 } from 'three'
import { leerColor } from '../../nucleo/colores'
import { RADIO_PERLA_RADIOS, SEGMENTOS_PERLA } from '../../nucleo/constantesFlujoTuberias'
import { useCalidad } from '../../estado/calidad'
import { useConexiones } from '../../estado/conexiones'
import { useSim } from '../../estado/simulacion'
import { conexiones } from './datos'
import { cantidadPerlas, construirRutas, puntoEnRuta, velocidadTramo } from './flujo'
import { construirTramos } from './geometria'

const FACTOR_CLARO = 0.55

/** Perlas que viajan por las tuberías en el sentido del flujo (ilustrativo). Una sola malla con instancias; la posición se calcula en cada cuadro sin pasar por React. */
export function FlujoTuberias({ referencia }: { referencia: number }) {
  const activo = useConexiones((s) => s.flujo && s.visibles)
  const calidad = useCalidad((s) => s.calidad)
  const rutas = useMemo(() => construirRutas(construirTramos(conexiones, referencia), conexiones.tramos), [referencia])
  const perlas = useMemo(() => rutas.map((r) => cantidadPerlas(r.largo, calidad)), [rutas, calidad])
  const total = perlas.reduce((a, b) => a + b, 0)
  const malla = useRef<InstancedMesh>(null)
  const avance = useRef<number[]>([])
  const matriz = useMemo(() => new Matrix4(), [])
  const radioMax = useMemo(() => Math.max(...rutas.map((r) => r.radio)), [rutas])

  const brillo = useMemo(() => leerColor('--color-perla-brillo'), [])

  // Colores por perla (una sola vez por calidad): el de su línea, aclarado para que se distinga del tubo.
  useLayoutEffect(() => {
    const m = malla.current
    if (!m) return
    let n = 0
    rutas.forEach((r, k) => {
      const c = new Color(leerColor(r.color)).lerp(new Color(brillo), FACTOR_CLARO)
      for (let i = 0; i < perlas[k]; i++) m.setColorAt(n++, c)
    })
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [rutas, perlas, total, brillo])

  useFrame((_, dt) => {
    const m = malla.current
    if (!m || !activo) return
    const s = useSim.getState()
    const caudales = { entrada: s.caudalEntrada, salida: s.caudalSalida, promedio: s.promedioDia }
    let n = 0
    rutas.forEach((r, k) => {
      if (s.corriendo) avance.current[k] = (avance.current[k] ?? 0) + velocidadTramo(r.caudal, caudales) * Math.min(dt, 0.1)
      const paso = r.largo / perlas[k]
      const radio = r.radio * RADIO_PERLA_RADIOS
      for (let i = 0; i < perlas[k]; i++) {
        const [x, y, z] = puntoEnRuta(r, (avance.current[k] ?? 0) + i * paso)
        matriz.makeScale(radio / radioMax, radio / radioMax, radio / radioMax).setPosition(x, y, z)
        m.setMatrixAt(n++, matriz)
      }
    })
    m.instanceMatrix.needsUpdate = true
  })

  if (!activo) return null
  return (
    <instancedMesh key={total} ref={malla} args={[undefined, undefined, total]} frustumCulled={false}>
      <sphereGeometry args={[radioMax, SEGMENTOS_PERLA, SEGMENTOS_PERLA]} />
      <meshStandardMaterial emissive={brillo} emissiveIntensity={0.25} />
    </instancedMesh>
  )
}
