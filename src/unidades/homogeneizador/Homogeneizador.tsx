import { useMemo } from 'react'
import { SEGMENTOS_CILINDRO } from '../../nucleo/constantes'
import { leerColor } from '../../nucleo/colores'
import { Accesorios } from './accesorios/Accesorios'
import { Anotaciones } from './anotaciones/Anotaciones'
import { Agua } from './Agua'
import { GeometriaAnillo } from '../comun/Anillo'
import type { DatosHomogeneizador } from './esquema'
import { construirPiezas, type TipoPieza } from './geometria'
import { opacidadPieza } from './opacidad'
import { Particulas } from './Particulas'
import { Remolino } from './Remolino'
import { useOpacidadCorte } from '../comun/useOpacidadCorte'
import { usePlanosCorte } from '../comun/usePlanosCorte'

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

export function Homogeneizador({ datos }: { datos: DatosHomogeneizador }) {
  const piezas = useMemo(() => construirPiezas(datos), [datos])
  const radio = datos.tanque.diametroInterior.valor / 2
  const planos = usePlanosCorte(radio)
  const opacidadMuros = useOpacidadCorte()
  return (
    <group>
      {piezas.map((p) => {
        const opacidad = opacidadPieza(p.tipo, opacidadMuros)
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
              clippingPlanes={planos}
            />
          </mesh>
        )
      })}
      <Accesorios datos={datos} />
      <Anotaciones datos={datos} />
      <Agua radio={radio} />
      <Particulas radioTanque={radio} />
      <Remolino radioZona={datos.agitador.diametroZonaMezcla.valor / 2} altura={datos.agitador.alturaImpulsor.valor} radioTanque={radio} />
    </group>
  )
}
