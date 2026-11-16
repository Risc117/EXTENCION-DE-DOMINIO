import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { InstancedMesh, Object3D } from 'three'
import { NUMERO_PARTICULAS, RADIO_PARTICULA } from '../../nucleo/constantes'
import { leerColor } from '../../nucleo/colores'
import { cantidadParticulas, useCalidad } from '../../estado/calidad'
import { bufferParticulas } from '../../estado/flujo'
import { usePlanosCorte } from '../comun/usePlanosCorte'

const apoyo = new Object3D()

/** Partículas del flujo: una sola malla con instancias, movida desde el buffer del estado. */
export function Particulas({ radioTanque }: { radioTanque: number }) {
  const malla = useRef<InstancedMesh>(null)
  const planos = usePlanosCorte(radioTanque)

  useFrame(() => {
    const m = malla.current
    if (!m) return
    const datos = bufferParticulas.posiciones
    const cantidad = cantidadParticulas(useCalidad.getState().calidad)
    m.count = cantidad
    for (let i = 0; i < cantidad; i++) {
      const o = i * 4
      apoyo.position.set(datos[o], datos[o + 1], datos[o + 2])
      apoyo.scale.setScalar(datos[o + 3])
      apoyo.updateMatrix()
      m.setMatrixAt(i, apoyo.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={malla} args={[undefined, undefined, NUMERO_PARTICULAS]} frustumCulled={false}>
      <sphereGeometry args={[RADIO_PARTICULA, 8, 8]} />
      <meshStandardMaterial color={leerColor('--color-particula')} clippingPlanes={planos} />
    </instancedMesh>
  )
}
