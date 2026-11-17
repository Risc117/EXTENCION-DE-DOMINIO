import { useMemo } from 'react'
import { DECIMAS_CAUDAL } from '../../nucleo/constantesCanales'
import { SALIDA_VERTEDERO } from '../../nucleo/constantesGotas'
import { useCorteActivo } from '../comun/useCorteActivo'
import { useSim } from '../../estado/simulacion'
import { Estructura } from '../comun/Estructura'
import { GotasCaen } from '../comun/GotasCaen'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { disponer } from './disposicion'
import type { DatosSedimentador } from './esquema'
import { construirAguas, construirPiezas, puntosVertedero } from './geometria'
import { laminaCanal } from './hidraulica'
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
  const corte = useCorteActivo()
  const caudalUnidad = (decimas / DECIMAS_CAUDAL) * fraccion
  const piezas = useMemo(() => construirPiezas(datos, corte, instancia), [datos, corte, instancia])
  const aguas = useMemo(() => construirAguas(datos, caudalUnidad), [datos, caudalUnidad])
  const cotas = useMemo(() => construirCotas(datos), [datos])
  const gotas = useMemo(() => puntosVertedero(datos, SALIDA_VERTEDERO), [datos])
  const s = disponer(datos)
  // Las gotas caen del nivel del vertedero a la lámina del canal perimetral.
  const yCanal = s.yCanalFondo + datos.tanque.espesorMuro.valor + laminaCanal(datos, caudalUnidad)
  const etiquetas = useMemo(() => construirEtiquetas(datos, caudalUnidad, instancia), [datos, caudalUnidad, instancia])
  return (
    <group>
      <Estructura piezas={piezas} aguas={aguas} cotas={cotas} etiquetas={etiquetas} radioCorte={s.radioCanalExterior} />
      <Puente datos={datos} />
      <GotasCaen puntos={gotas} yArriba={s.yAgua} yAbajo={yCanal} />
    </group>
  )
}
