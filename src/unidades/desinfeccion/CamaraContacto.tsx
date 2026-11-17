import { useMemo } from 'react'
import { DECIMAS_CAUDAL } from '../../nucleo/constantesCanales'
import { useCorteActivo } from '../comun/useCorteActivo'
import { useSim } from '../../estado/simulacion'
import { Estructura } from '../comun/Estructura'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { disponer } from './disposicion'
import type { DatosDesinfeccion } from './esquema'
import { construirAguas, construirPiezas } from './geometria'

/** Cámara de contacto: laberinto de 4 canales; el agua sube y baja con el caudal y los muros son opacos (translúcidos con "Ver corte"). */
export function CamaraContacto({ datos }: { datos: DatosDesinfeccion }) {
  const decimas = useSim((s) => Math.round(s.caudalEntrada * DECIMAS_CAUDAL))
  const corte = useCorteActivo()
  const caudal = decimas / DECIMAS_CAUDAL
  const piezas = useMemo(() => construirPiezas(datos, corte), [datos, corte])
  const aguas = useMemo(() => construirAguas(datos, caudal), [datos, caudal])
  const cotas = useMemo(() => construirCotas(datos), [datos])
  const etiquetas = useMemo(() => construirEtiquetas(datos, caudal), [datos, caudal])
  return <Estructura piezas={piezas} aguas={aguas} cotas={cotas} etiquetas={etiquetas} radioCorte={disponer(datos).mitadLargo} />
}
