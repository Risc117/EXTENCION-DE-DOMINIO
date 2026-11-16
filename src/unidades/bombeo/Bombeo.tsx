import { useMemo } from 'react'
import { useBombeo } from '../../estado/bombeo'
import { Estructura } from '../comun/Estructura'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { disponer } from './disposicion'
import type { DatosBombeo } from './esquema'
import { construirAguas, construirPiezas } from './geometria'

const CENTIMETROS = 100

/** Estación de bombeo: el agua del cárcamo sube y baja, y la bomba en marcha se pinta de verde. */
export function Bombeo({ datos }: { datos: DatosBombeo }) {
  const centimetros = useBombeo((s) => Math.round(s.nivel * CENTIMETROS))
  const activa = useBombeo((s) => s.bombaActiva)
  const nivel = centimetros / CENTIMETROS
  const piezas = useMemo(() => construirPiezas(datos, activa), [datos, activa])
  const aguas = useMemo(() => construirAguas(datos, nivel), [datos, nivel])
  const cotas = useMemo(() => construirCotas(datos), [datos])
  const etiquetas = useMemo(() => construirEtiquetas(datos, nivel, activa), [datos, nivel, activa])
  return <Estructura piezas={piezas} aguas={aguas} cotas={cotas} etiquetas={etiquetas} radioCorte={disponer(datos).radioExterior} />
}
