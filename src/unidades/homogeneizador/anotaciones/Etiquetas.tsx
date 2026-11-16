import { useMemo } from 'react'
import { Etiqueta } from '../../comun/Etiqueta'
import { useSim } from '../../../estado/simulacion'
import type { DatosHomogeneizador } from '../esquema'
import type { DefEtiqueta } from '../esquemaAnotaciones'
import { calcularEtiqueta } from './construirEtiquetas'

/** La etiqueta del nivel de agua: sigue el nivel actual de la simulación (redondeado al centímetro). */
export function EtiquetaNivel({ datos, def }: { datos: DatosHomogeneizador; def: DefEtiqueta }) {
  const centimetros = useSim((s) => Math.round(s.nivel * 100))
  const etiqueta = useMemo(() => calcularEtiqueta(datos, def, centimetros / 100), [datos, def, centimetros])
  return <Etiqueta etiqueta={etiqueta} />
}
