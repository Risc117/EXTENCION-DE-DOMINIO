import { useMemo } from 'react'
import { DECIMAS_CAUDAL } from '../../nucleo/constantesCanales'
import { useSim } from '../../estado/simulacion'
import { espejarAguas, espejarCotas, espejarEtiquetas, espejarPiezas } from '../comun/espejo'
import { Estructura } from '../comun/Estructura'
import type { Agua } from '../comun/tipos'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { disponer } from './disposicion'
import type { DatosRejas } from './esquema'
import { construirAguas, construirPiezas } from './geometria'

/** Cámara de rejas con by-pass; el agua sigue el caudal de la simulación (redondeado a décimas de L/s para no redibujar de más). */
export function Rejas({ datos }: { datos: DatosRejas }) {
  const decimas = useSim((s) => Math.round(s.caudalEntrada * DECIMAS_CAUDAL))
  // La geometría se arma con el by-pass hacia +z; si el plano lo pone del otro lado se refleja todo.
  const espejo = datos.bypass.lado.valor === -1
  const piezas = useMemo(() => (espejo ? espejarPiezas(construirPiezas(datos)) : construirPiezas(datos)), [datos, espejo])
  const aguas = useMemo(() => (espejo ? espejarAguas : (a: Agua[]) => a)(construirAguas(datos, decimas / DECIMAS_CAUDAL)), [datos, decimas, espejo])
  const cotas = useMemo(() => (espejo ? espejarCotas(construirCotas(datos)) : construirCotas(datos)), [datos, espejo])
  const etiquetas = useMemo(() => (espejo ? espejarEtiquetas(construirEtiquetas(datos)) : construirEtiquetas(datos)), [datos, espejo])
  return <Estructura piezas={piezas} aguas={aguas} cotas={cotas} etiquetas={etiquetas} radioCorte={disponer(datos).zMuroExterior} />
}
