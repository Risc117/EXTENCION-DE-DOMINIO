import { useMemo } from 'react'
import escala from '../../../datos/escalaCaudal.json'
import { DECIMAS_CAUDAL } from '../../nucleo/constantesCanales'
import { useCorte } from '../../estado/flujo'
import { useSim } from '../../estado/simulacion'
import { Estructura } from '../comun/Estructura'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { disponer } from './disposicion'
import type { DatosRafa } from './esquema'
import { construirAguas, construirPiezas } from './geometria'
import { nivelAgua, retencionHoja, retencionPlano } from './hidraulica'

const CAUDAL_MAXIMO = escala.caudalMaximoHorario.valor

/** RAFA: muros opacos (translúcidos con "Ver corte"), el agua sube con el caudal de la simulación y los TR de la hoja y del plano se muestran aparte. */
export function Rafa({ datos }: { datos: DatosRafa }) {
  const decimas = useSim((s) => Math.round(s.caudalEntrada * DECIMAS_CAUDAL))
  const corte = useCorte((s) => s.activo)
  const caudal = decimas / DECIMAS_CAUDAL
  const piezas = useMemo(() => construirPiezas(datos, corte), [datos, corte])
  const aguas = useMemo(() => construirAguas(datos, caudal, CAUDAL_MAXIMO), [datos, caudal])
  const cotas = useMemo(() => construirCotas(datos), [datos])
  const etiquetas = useMemo(
    () => construirEtiquetas(datos, nivelAgua(datos, caudal, CAUDAL_MAXIMO), retencionHoja(datos, caudal), retencionPlano(datos, caudal)),
    [datos, caudal],
  )
  return <Estructura piezas={piezas} aguas={aguas} cotas={cotas} etiquetas={etiquetas} radioCorte={disponer(datos).semiAncho} />
}
