import { useMemo } from 'react'
import { GIRO_EJE_DREN, PASOS_NIVEL_LODO } from '../../nucleo/constantesLechos'
import { useCorte } from '../../estado/flujo'
import { useSim } from '../../estado/simulacion'
import { Estructura } from '../comun/Estructura'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { disponer } from './disposicion'
import type { DatosLechos } from './esquema'
import { construirPiezas } from './geometria'
import { nivelLodo } from './hidraulica'

/** Lecho de secado: muros opacos (translúcidos con "Ver corte"), capas, piso inclinado hacia el dren y lodo que sube y baja con el reloj de la simulación (de ejemplo). */
export function Lechos({ datos }: { datos: DatosLechos }) {
  const hora = useSim((s) => s.hora)
  const corte = useCorte((s) => s.activo)
  // Redondeado al centímetro: las piezas se rearman solo cuando el lodo cambia de verdad.
  const lodo = Math.round(nivelLodo(datos, hora) * PASOS_NIVEL_LODO) / PASOS_NIVEL_LODO
  const piezas = useMemo(() => construirPiezas(datos, corte, lodo), [datos, corte, lodo])
  const cotas = useMemo(() => construirCotas(datos), [datos])
  const etiquetas = useMemo(() => construirEtiquetas(datos, lodo), [datos, lodo])
  const s = disponer(datos)
  return (
    <group rotation={[0, GIRO_EJE_DREN, 0]}>
      <Estructura piezas={piezas} aguas={[]} cotas={cotas} etiquetas={etiquetas} radioCorte={s.anchoConjunto / 2} />
    </group>
  )
}
