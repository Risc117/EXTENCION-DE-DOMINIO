import { useMemo } from 'react'
import { SEGMENTOS_CILINDRO } from '../../nucleo/constantes'
import { leerColor } from '../../nucleo/colores'
import type { DatosHomogeneizador } from './esquema'
import { construirPiezas, type TipoPieza } from './geometria'

const COLOR: Record<TipoPieza, string> = {
  piso: '--color-piso',
  muro: '--color-muro',
  ingreso: '--color-ingreso',
  salida: '--color-salida',
  difusor: '--color-difusor',
}

export function Homogeneizador({ datos }: { datos: DatosHomogeneizador }) {
  const piezas = useMemo(() => construirPiezas(datos), [datos])
  return (
    <group>
      {piezas.map((p) => (
        <mesh key={p.id} position={p.posicion} rotation={p.forma === 'cilindro' ? p.rotacion : undefined}>
          {p.forma === 'caja' ? (
            <boxGeometry args={p.tamano} />
          ) : (
            <cylinderGeometry args={[p.radio, p.radio, p.largo, SEGMENTOS_CILINDRO]} />
          )}
          <meshStandardMaterial color={leerColor(COLOR[p.tipo])} />
        </mesh>
      ))}
    </group>
  )
}
