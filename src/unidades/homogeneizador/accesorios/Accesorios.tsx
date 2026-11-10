import { useMemo } from 'react'
import type { Plane } from 'three'
import { OPACIDAD_RELLENO, OPACIDAD_TERRENO, SEGMENTOS_CILINDRO } from '../../../nucleo/constantes'
import { leerColor } from '../../../nucleo/colores'
import { useAccesorios } from '../../../estado/accesorios'
import { GeometriaAnillo } from '../Anillo'
import type { DatosHomogeneizador } from '../esquema'
import { usePlanosCorte } from '../usePlanosCorte'
import { construirAccesorios } from './index'
import type { PiezaAccesorio, TipoAccesorio } from './tipos'

const COLOR: Record<TipoAccesorio, string> = {
  baranda: '--color-baranda',
  'riel-baranda': '--color-baranda',
  portillo: '--color-portillo',
  brocal: '--color-acceso',
  tapa: '--color-acceso',
  'escalera-riel': '--color-escalera',
  peldano: '--color-escalera',
  jaula: '--color-escalera',
  ventilacion: '--color-ventilacion',
  hongo: '--color-ventilacion',
  'caja-valvula': '--color-acceso',
  varilla: '--color-valvula',
  valvula: '--color-valvula',
  relleno: '--color-relleno',
  terreno: '--color-terreno',
}

/** El terreno y el relleno son semitransparentes: se ve el tanque enterrado y el corte. */
const OPACIDAD: Partial<Record<TipoAccesorio, number>> = { relleno: OPACIDAD_RELLENO, terreno: OPACIDAD_TERRENO }

function Geometria({ p }: { p: PiezaAccesorio }) {
  switch (p.forma) {
    case 'caja':
      return <boxGeometry args={p.tamano} />
    case 'cilindro':
      return <cylinderGeometry args={[p.radio, p.radio, p.largo, SEGMENTOS_CILINDRO]} />
    case 'cono':
      return <cylinderGeometry args={[0, p.radio, p.largo, SEGMENTOS_CILINDRO]} />
    case 'anillo':
      return <GeometriaAnillo radioInterior={p.radioInterior} radioExterior={p.radioExterior} alto={p.alto} />
  }
}

function Material({ tipo, planos }: { tipo: TipoAccesorio; planos: Plane[] }) {
  const opacidad = OPACIDAD[tipo]
  return (
    <meshStandardMaterial
      color={leerColor(COLOR[tipo])}
      transparent={opacidad !== undefined}
      opacity={opacidad ?? 1}
      depthWrite={opacidad === undefined}
      clippingPlanes={planos}
    />
  )
}

/** Accesorios del plano (baranda, boca de acceso, escalera, ventilación, válvulas y terreno). Se ocultan con el interruptor. */
export function Accesorios({ datos }: { datos: DatosHomogeneizador }) {
  const visibles = useAccesorios((s) => s.visibles)
  const piezas = useMemo(() => construirAccesorios(datos), [datos])
  const planos = usePlanosCorte(datos.tanque.diametroInterior.valor / 2)
  if (!visibles) return null
  return (
    <group>
      {piezas.map((p) => (
        <mesh key={p.id} position={p.posicion} rotation={'rotacion' in p ? p.rotacion : undefined}>
          <Geometria p={p} />
          <Material tipo={p.tipo} planos={planos} />
        </mesh>
      ))}
    </group>
  )
}
