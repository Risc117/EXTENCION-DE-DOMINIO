import { useMemo } from 'react'
import { DECIMAS_CAUDAL } from '../../nucleo/constantesCanales'
import { useSim } from '../../estado/simulacion'
import { Estructura } from '../comun/Estructura'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { disponer } from './disposicion'
import type { DatosParshall } from './esquema'
import { construirAguas, construirPiezas } from './geometria'
import { cargaHo } from './hidraulica'

/** Canaleta Parshall: el agua sube con el caudal de la simulación según Ho = K · Q^m de la hoja. */
export function Parshall({ datos }: { datos: DatosParshall }) {
  const decimas = useSim((s) => Math.round(s.caudalEntrada * DECIMAS_CAUDAL))
  const caudal = decimas / DECIMAS_CAUDAL
  const piezas = useMemo(() => construirPiezas(datos), [datos])
  const aguas = useMemo(() => construirAguas(datos, caudal), [datos, caudal])
  const cotas = useMemo(() => construirCotas(datos), [datos])
  const etiquetas = useMemo(() => construirEtiquetas(datos, cargaHo(datos, caudal)), [datos, caudal])
  return <Estructura piezas={piezas} aguas={aguas} cotas={cotas} etiquetas={etiquetas} radioCorte={disponer(datos).semiancho} />
}
