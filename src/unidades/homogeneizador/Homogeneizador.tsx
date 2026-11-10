import { useMemo } from 'react'
import { OPACIDAD_MURO, OPACIDAD_TECHO, OPACIDAD_ZONA_MEZCLA, SEGMENTOS_CILINDRO } from '../../nucleo/constantes'
import { leerColor } from '../../nucleo/colores'
import { GeometriaAnillo } from './Anillo'
import type { DatosHomogeneizador } from './esquema'
import { construirPiezas, type TipoPieza } from './geometria'

const COLOR: Record<TipoPieza, string> = {
  solado: '--color-solado',
  'losa-fondo': '--color-piso',
  muro: '--color-muro',
  'losa-techo': '--color-losa',
  ingreso: '--color-ingreso',
  salida: '--color-salida',
  rebose: '--color-rebose',
  agitador: '--color-agitador',
  riel: '--color-agitador',
  'zona-mezcla': '--color-zona-mezcla',
}

/** Piezas semitransparentes para ver el interior. */
const OPACIDAD: Partial<Record<TipoPieza, number>> = {
  muro: OPACIDAD_MURO,
  'losa-techo': OPACIDAD_TECHO,
  'zona-mezcla': OPACIDAD_ZONA_MEZCLA,
}

export function Homogeneizador({ datos }: { datos: DatosHomogeneizador }) {
  const piezas = useMemo(() => construirPiezas(datos), [datos])
  return (
    <group>
      {piezas.map((p) => {
        const opacidad = OPACIDAD[p.tipo]
        return (
          <mesh key={p.id} position={p.posicion} rotation={p.forma === 'cilindro' ? p.rotacion : undefined}>
            {p.forma === 'anillo' ? (
              <GeometriaAnillo radioInterior={p.radioInterior} radioExterior={p.radioExterior} alto={p.alto} />
            ) : (
              <cylinderGeometry args={[p.radio, p.radio, p.largo, SEGMENTOS_CILINDRO]} />
            )}
            <meshStandardMaterial
              color={leerColor(COLOR[p.tipo])}
              transparent={opacidad !== undefined}
              opacity={opacidad ?? 1}
              depthWrite={opacidad === undefined}
            />
          </mesh>
        )
      })}
    </group>
  )
}
