import { useMemo } from 'react'
import lineaCruda from '../../../datos/linea.json'
import { DECIMAS_CAUDAL } from '../../nucleo/constantesCanales'
import { useCorteActivo } from '../comun/useCorteActivo'
import { useSim } from '../../estado/simulacion'
import { Estructura } from '../comun/Estructura'
import { construirCotas, construirEtiquetas } from './anotaciones'
import type { DatosReparto } from './esquema'
import { construirAguas, construirPiezas } from './geometria'

/** Fracción del caudal que la cámara manda a cada sedimentador (datos/linea.json: 0.5 = Q/2). */
const destinos = (lineaCruda.nodos.find((n) => n.id === 'camara-reparto') as { destinos: { fraccion: number }[] }).destinos
const FRACCION = destinos[0].fraccion

/** Cámara de reparto: reparte el caudal en partes iguales a los dos sedimentadores. */
export function Reparto({ datos }: { datos: DatosReparto }) {
  const decimas = useSim((s) => Math.round(s.caudalEntrada * DECIMAS_CAUDAL))
  const corte = useCorteActivo()
  const caudal = decimas / DECIMAS_CAUDAL
  const piezas = useMemo(() => construirPiezas(datos, corte), [datos, corte])
  const aguas = useMemo(() => construirAguas(datos), [datos])
  const cotas = useMemo(() => construirCotas(datos), [datos])
  const etiquetas = useMemo(() => construirEtiquetas(datos, caudal, FRACCION), [datos, caudal])
  return <Estructura piezas={piezas} aguas={aguas} cotas={cotas} etiquetas={etiquetas} radioCorte={datos.caja.ancho.valor / 2} />
}
