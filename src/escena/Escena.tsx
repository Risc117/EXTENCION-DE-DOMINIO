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
import { cotaReferencia } from '../unidades/ubicar'
import { ControlCamara } from './ControlCamara'
import { encuadre } from './encuadre'
import { EntornoTerreno } from './terreno'
import { UnidadColocada } from './UnidadColocada'

const referencia = cotaReferencia(unidades)

export function Escena() {
  const { objetivo, escala } = encuadre(unidades, null)
  const d = escala * DISTANCIA_CAMARA
  const [ox, , oz] = objetivo
  return (
    <Canvas gl={{ localClippingEnabled: true }} camera={{ position: [ox + d, d * CAMARA_ALTURA_FACTOR, oz + d], fov: CAMARA_FOV, near: CAMARA_NEAR, far: escala * CAMARA_FAR_FACTOR }}>
      <ambientLight intensity={LUZ_AMBIENTE} />
      <directionalLight position={[ox + escala, escala * LUZ_ALTURA_FACTOR, oz + escala]} intensity={LUZ_DIRECCIONAL} />
      <EntornoTerreno referencia={referencia} unidades={unidades} />
      {unidades.map((u) => (
        <UnidadColocada key={u.id} unidad={u} referencia={referencia} />
      ))}
      <ControlCamara unidades={unidades} />
    </Canvas>
  )
}
