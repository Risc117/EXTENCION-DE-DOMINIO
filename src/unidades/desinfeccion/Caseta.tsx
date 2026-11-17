import { useMemo } from 'react'
import { DECIMAS_CAUDAL } from '../../nucleo/constantesCanales'
import { useCorteActivo } from '../comun/useCorteActivo'
import { useSim } from '../../estado/simulacion'
import { seguridad } from '../comun/datosSeguridad'
import { Estructura } from '../comun/Estructura'
import { construirCotasCaseta, construirEtiquetasCaseta } from './anotacionesCaseta'
import type { DatosDesinfeccion } from './esquema'
import { construirEmergencia } from './emergencia'
import { construirPiezasCaseta } from './geometriaCaseta'

/** Caseta de cloración: tanque de solución, bomba dosificadora y línea de 1/2", y afuera la ducha de emergencia y el lavaojos. El techo es accesorio (se oculta para ver adentro). */
export function Caseta({ datos }: { datos: DatosDesinfeccion }) {
  const decimas = useSim((s) => Math.round(s.caudalEntrada * DECIMAS_CAUDAL))
  const corte = useCorteActivo()
  const caudal = decimas / DECIMAS_CAUDAL
  const piezas = useMemo(() => [...construirPiezasCaseta(datos, corte), ...construirEmergencia(datos, seguridad.emergencia)], [datos, corte])
  const cotas = useMemo(() => construirCotasCaseta(datos), [datos])
  const etiquetas = useMemo(() => construirEtiquetasCaseta(datos, caudal), [datos, caudal])
  return <Estructura piezas={piezas} aguas={[]} cotas={cotas} etiquetas={etiquetas} radioCorte={datos.caseta.largo.valor / 2} />
}
