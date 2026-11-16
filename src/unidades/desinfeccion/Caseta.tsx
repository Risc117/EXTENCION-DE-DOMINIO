import { useMemo } from 'react'
import { DECIMAS_CAUDAL } from '../../nucleo/constantesCanales'
import { useCorte } from '../../estado/flujo'
import { useSim } from '../../estado/simulacion'
import { Estructura } from '../comun/Estructura'
import { construirCotasCaseta, construirEtiquetasCaseta } from './anotacionesCaseta'
import type { DatosDesinfeccion } from './esquema'
import { construirPiezasCaseta } from './geometriaCaseta'

/** Caseta de cloración: tanque de solución, bomba dosificadora y línea de 1/2". El techo es accesorio (se oculta para ver adentro). */
export function Caseta({ datos }: { datos: DatosDesinfeccion }) {
  const decimas = useSim((s) => Math.round(s.caudalEntrada * DECIMAS_CAUDAL))
  const corte = useCorte((s) => s.activo)
  const caudal = decimas / DECIMAS_CAUDAL
  const piezas = useMemo(() => construirPiezasCaseta(datos, corte), [datos, corte])
  const cotas = useMemo(() => construirCotasCaseta(datos), [datos])
  const etiquetas = useMemo(() => construirEtiquetasCaseta(datos, caudal), [datos, caudal])
  return <Estructura piezas={piezas} aguas={[]} cotas={cotas} etiquetas={etiquetas} radioCorte={datos.caseta.largo.valor / 2} />
}
