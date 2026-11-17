import { Canvas } from '@react-three/fiber'
import {
  CAMARA_ALTURA_FACTOR,
  CAMARA_FAR_FACTOR,
  CAMARA_FOV,
  CAMARA_NEAR,
  DISTANCIA_CAMARA,
} from '../nucleo/constantes'
import { useCalidad } from '../estado/calidad'
import { Luminarias, Manga, PublicarViento } from '../unidades/ambiente'
import { Biogas } from '../unidades/biogas'
import { Conexiones, FlujoTuberias } from '../unidades/conexiones'
import { Entorno } from '../unidades/entorno'
import { Personal, Pluma } from '../unidades/personal'
import { Vida } from '../unidades/vida'
import { unidades } from '../unidades/registro'
import { cotaReferencia } from '../unidades/ubicar'
import { ControlCamara } from './ControlCamara'
import { Luces } from './Luces'
import { Sombras } from './Sombras'
import { encuadre } from './encuadre'
import { EntornoTerreno } from './terreno'
import { UnidadColocada } from './UnidadColocada'

const referencia = cotaReferencia(unidades)

export function Escena() {
  const { objetivo, escala } = encuadre(unidades, null)
  const d = escala * DISTANCIA_CAMARA
  const [ox, , oz] = objetivo
  const sombras = useCalidad((s) => s.calidad === 'alta')
  return (
    <Canvas shadows={sombras} gl={{ localClippingEnabled: true }} camera={{ position: [ox + d, d * CAMARA_ALTURA_FACTOR, oz + d], fov: CAMARA_FOV, near: CAMARA_NEAR, far: escala * CAMARA_FAR_FACTOR }}>
      <Luces objetivo={objetivo} />
      <Sombras />
      <EntornoTerreno referencia={referencia} unidades={unidades} />
      {unidades.map((u) => (
        <UnidadColocada key={u.id} unidad={u} referencia={referencia} />
      ))}
      <Conexiones referencia={referencia} />
      <FlujoTuberias referencia={referencia} />
      <Entorno referencia={referencia} />
      <Biogas referencia={referencia} />
      <Luminarias referencia={referencia} />
      <Manga referencia={referencia} />
      <PublicarViento />
      <Vida referencia={referencia} />
      <Pluma referencia={referencia} />
      <Personal referencia={referencia} />
      <ControlCamara unidades={unidades} />
    </Canvas>
  )
}
