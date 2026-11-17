import { useMemo } from 'react'
import { DECIMAS_CAUDAL } from '../../nucleo/constantesCanales'
import { useCorte } from '../../estado/flujo'
import { useSim } from '../../estado/simulacion'
import { Estructura } from '../comun/Estructura'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { disponer } from './disposicion'
import type { DatosSedimentador } from './esquema'
import { construirAguas, construirPiezas } from './geometria'
import { Puente } from './Puente'

interface Props {
  datos: DatosSedimentador
  /** Parte del caudal total que recibe esta unidad (0.5 = Q/2, según la cámara de reparto de datos/linea.json). */
  fraccion: number
  /** Id de esta instancia ("sedimentador-1" o "sedimentador-2"): decide hacia dónde salen sus tubos. */
  instancia: string
}

/** Un sedimentador: muros opacos (translúcidos con "Ver corte"), puente que gira y agua según el caudal que le toca. */
export function Sedimentador({ datos, fraccion, instancia }: Props) {
  const decimas = useSim((s) => Math.round(s.caudalEntrada * DECIMAS_CAUDAL))
  const corte = useCorte((s) => s.activo)
  const caudalUnidad = (decimas / DECIMAS_CAUDAL) * fraccion
  const piezas = useMemo(() => construirPiezas(datos, corte, instancia), [datos, corte, instancia])
  const aguas = useMemo(() => construirAguas(datos, caudalUnidad), [datos, caudalUnidad])
  const cotas = useMemo(() => construirCotas(datos), [datos])
  const etiquetas = useMemo(() => construirEtiquetas(datos, caudalUnidad, instancia), [datos, caudalUnidad, instancia])
  return (
    <group>
      <Estructura piezas={piezas} aguas={aguas} cotas={cotas} etiquetas={etiquetas} radioCorte={disponer(datos).radioCanalExterior} />
      <Puente datos={datos} />
    </group>
  )
}
