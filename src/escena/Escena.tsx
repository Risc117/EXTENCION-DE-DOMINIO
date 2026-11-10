import { Canvas } from '@react-three/fiber'
import {
  CAMARA_ALTURA_FACTOR,
  CAMARA_FAR_FACTOR,
  CAMARA_FOV,
  CAMARA_NEAR,
  DISTANCIA_CAMARA,
  LUZ_ALTURA_FACTOR,
  LUZ_AMBIENTE,
  LUZ_DIRECCIONAL,
} from '../nucleo/constantes'
import { unidades } from '../unidades/registro'
import { ControlCamara } from './ControlCamara'

export function Escena() {
  const tamano = Math.max(...unidades.map((u) => u.tamano))
  const d = tamano * DISTANCIA_CAMARA
  return (
    <Canvas gl={{ localClippingEnabled: true }} camera={{ position: [d, d * CAMARA_ALTURA_FACTOR, d], fov: CAMARA_FOV, near: CAMARA_NEAR, far: tamano * CAMARA_FAR_FACTOR }}>
      <ambientLight intensity={LUZ_AMBIENTE} />
      <directionalLight position={[tamano, tamano * LUZ_ALTURA_FACTOR, tamano]} intensity={LUZ_DIRECCIONAL} />
      {unidades.map((u) => (
        <u.Componente key={u.id} />
      ))}
      <ControlCamara tamano={tamano} />
    </Canvas>
  )
}
