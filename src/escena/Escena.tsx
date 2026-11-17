import { Canvas } from '@react-three/fiber'
import {
  CAMARA_ALTURA_FACTOR,
  CAMARA_FAR_FACTOR,
  CAMARA_FOV,
  CAMARA_NEAR,
  DISTANCIA_CAMARA,
} from '../nucleo/constantes'
import { useCalidad } from '../estado/calidad'
import { useAR } from '../estado/ar'
import { useVR } from '../estado/vr'
import { Luminarias, Manga, PublicarViento } from '../unidades/ambiente'
import { Biogas } from '../unidades/biogas'
import { Conexiones, FlujoTuberias } from '../unidades/conexiones'
import { Entorno } from '../unidades/entorno'
import { Personal, Pluma } from '../unidades/personal'
import { Vida } from '../unidades/vida'
import { unidades } from '../unidades/registro'
import { cotaReferencia } from '../unidades/ubicar'
import { GrupoMaqueta } from './ar/GrupoMaqueta'
import { PuenteAR } from './ar/PuenteAR'
import { ControlCamara } from './ControlCamara'
import { EtiquetasPlanta } from './EtiquetasPlanta'
import { Luces } from './Luces'
import { RigVR } from './vr/RigVR'
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
  const vr = useVR((s) => s.activo)
  const ar = useAR((s) => s.activo)
  return (
    <Canvas shadows={sombras} gl={{ localClippingEnabled: true }} camera={{ position: [ox + d, d * CAMARA_ALTURA_FACTOR, oz + d], fov: CAMARA_FOV, near: CAMARA_NEAR, far: escala * CAMARA_FAR_FACTOR }}>
      <Luces objetivo={objetivo} />
      <Sombras />
      {/* Toda la planta va en un grupo: en AR se achica a maqueta y se coloca donde se toca; fuera de AR no cambia nada. */}
      <GrupoMaqueta centro={objetivo} extension={escala}>
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
        {!vr && !ar && <EtiquetasPlanta referencia={referencia} />}
      </GrupoMaqueta>
      {ar && <PuenteAR />}
      {vr ? <RigVR referencia={referencia} /> : !ar && <ControlCamara unidades={unidades} />}
    </Canvas>
  )
}
