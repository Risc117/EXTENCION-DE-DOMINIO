import { useMemo } from 'react'
import escala from '../../../datos/escalaCaudal.json'
import lineaCruda from '../../../datos/linea.json'
import { DECIMAS_CAUDAL } from '../../nucleo/constantesCanales'
import { useCorteActivo } from '../comun/useCorteActivo'
import { useSim } from '../../estado/simulacion'
import { Estructura } from '../comun/Estructura'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { Brazos } from './Brazos'
import { disponer } from './disposicion'
import type { DatosPercolador } from './esquema'
import { construirAguas, construirPiezas } from './geometria'

const CAUDAL_MAXIMO = escala.caudalMaximoHorario.valor
const contacto = (lineaCruda.nodos.find((n) => n.id === 'percolador') as { retencion: { valor: number; demo: boolean } }).retencion

/** Filtro percolador: muro opaco (translúcido con "Ver corte"), brazos que giran con el caudal, agua según el caudal de la simulación. */
export function Percolador({ datos }: { datos: DatosPercolador }) {
  const decimas = useSim((s) => Math.round(s.caudalEntrada * DECIMAS_CAUDAL))
  const corte = useCorteActivo()
  const caudal = decimas / DECIMAS_CAUDAL
  const piezas = useMemo(() => construirPiezas(datos, corte), [datos, corte])
  const aguas = useMemo(() => construirAguas(datos, caudal, CAUDAL_MAXIMO), [datos, caudal])
  const cotas = useMemo(() => construirCotas(datos), [datos])
  const etiquetas = useMemo(() => construirEtiquetas(datos, caudal, CAUDAL_MAXIMO, contacto.valor, contacto.demo), [datos, caudal])
  return (
    <group>
      <Estructura piezas={piezas} aguas={aguas} cotas={cotas} etiquetas={etiquetas} radioCorte={disponer(datos).radioExterior} />
      <Brazos datos={datos} />
    </group>
  )
}
