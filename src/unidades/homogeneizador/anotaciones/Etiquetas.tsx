import { Html, Line } from '@react-three/drei'
import { useMemo } from 'react'
import { CAPA_TEXTO_ANOTACION, GROSOR_LINEA_ANOTACION, LARGO_FLECHA, ORDEN_ANOTACIONES } from '../../../nucleo/constantes'
import { leerColor } from '../../../nucleo/colores'
import { useSim } from '../../../estado/simulacion'
import type { DatosHomogeneizador } from '../esquema'
import type { DefEtiqueta } from '../esquemaAnotaciones'
import { calcularEtiqueta } from './construirEtiquetas'
import { Flecha } from './Flecha'
import type { EtiquetaCalculada } from './tipos'

/** Una etiqueta: texto, línea y flecha que apunta a su pieza. */
export function Etiqueta({ etiqueta }: { etiqueta: EtiquetaCalculada }) {
  const { origen, punta, texto } = etiqueta
  const color = useMemo(() => leerColor('--color-etiqueta-linea'), [])
  const puntos = useMemo(() => [origen, punta], [origen, punta])
  const direccion = useMemo<[number, number, number]>(() => [punta[0] - origen[0], punta[1] - origen[1], punta[2] - origen[2]], [origen, punta])
  const largo = Math.min(LARGO_FLECHA, Math.hypot(...direccion) / 3)
  return (
    <group>
      <Line points={puntos} color={color} lineWidth={GROSOR_LINEA_ANOTACION} depthTest={false} renderOrder={ORDEN_ANOTACIONES} />
      <Flecha punta={punta} direccion={direccion} largo={largo} color={color} />
      <Html position={origen} center zIndexRange={CAPA_TEXTO_ANOTACION} className="anotacion anotacion--etiqueta">
        {texto}
      </Html>
    </group>
  )
}

/** La etiqueta del nivel de agua: sigue el nivel actual de la simulación (redondeado al centímetro). */
export function EtiquetaNivel({ datos, def }: { datos: DatosHomogeneizador; def: DefEtiqueta }) {
  const centimetros = useSim((s) => Math.round(s.nivel * 100))
  const etiqueta = useMemo(() => calcularEtiqueta(datos, def, centimetros / 100), [datos, def, centimetros])
  return <Etiqueta etiqueta={etiqueta} />
}
