import { useMemo } from 'react'
import { DECIMAS_CAUDAL } from '../../nucleo/constantesCanales'
import { useSim } from '../../estado/simulacion'
import { Estructura } from '../comun/Estructura'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { disponer } from './disposicion'
import type { DatosDesarenador } from './esquema'
import { construirAguas, construirPiezas } from './geometria'

/** Desarenador de un canal con tolva y vertedero Sutro; el agua sigue el caudal de la simulación. */
export function Desarenador({ datos }: { datos: DatosDesarenador }) {
  const decimas = useSim((s) => Math.round(s.caudalEntrada * DECIMAS_CAUDAL))
  const piezas = useMemo(() => construirPiezas(datos), [datos])
  const aguas = useMemo(() => construirAguas(datos, decimas / DECIMAS_CAUDAL), [datos, decimas])
  const cotas = useMemo(() => construirCotas(datos), [datos])
  const etiquetas = useMemo(() => construirEtiquetas(datos), [datos])
  return <Estructura piezas={piezas} aguas={aguas} cotas={cotas} etiquetas={etiquetas} radioCorte={disponer(datos).semiancho} />
}
