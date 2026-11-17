import { useMemo } from 'react'
import { useCalidad } from '../../../estado/calidad'
import type { DatosHomogeneizador } from '../esquema'
import { cotaTecho } from '../accesorios/cotas'
import { calcularEtiqueta } from './construirEtiquetas'
import { construirCotas } from './construirCotas'
import { Cota } from '../../comun/Cotas'
import { useAnotacionesVisibles } from '../../comun/useAnotacionesVisibles'
import { Etiqueta } from '../../comun/Etiqueta'
import { EtiquetaNivel } from './Etiquetas'
import { useVisibles, type Candidato, type LimitesTanque } from './useVisibles'
import { filtrarPorCalidad } from './visibilidad'

/** Cotas (medidas con flechas) y etiquetas (nombres de las piezas), definidas en el JSON. Salen al acercarse a la estructura y se ocultan con sus botones. */
export function Anotaciones({ datos }: { datos: DatosHomogeneizador }) {
  const { cotas: verCotas, etiquetas: verEtiquetas } = useAnotacionesVisibles()
  const calidad = useCalidad((s) => s.calidad)

  const limites = useMemo<LimitesTanque>(
    () => ({
      radioExterior: datos.tanque.diametroExterior.valor / 2,
      radioInterior: datos.tanque.diametroInterior.valor / 2,
      yMin: 0,
      yMax: cotaTecho(datos),
    }),
    [datos],
  )

  const cotas = useMemo(() => construirCotas(datos), [datos])
  const defs = useMemo(() => filtrarPorCalidad(datos.anotaciones.etiquetas, calidad), [datos, calidad])
  const etiquetas = useMemo(() => defs.map((def) => calcularEtiqueta(datos, def, 0)), [datos, defs])

  const candidatosCotas = useMemo<Candidato[]>(() => cotas.map((c) => ({ id: c.id, anclaje: c.centro, tapable: false })), [cotas])
  const candidatosEtiquetas = useMemo<Candidato[]>(
    () => etiquetas.map((e) => ({ id: e.id, anclaje: e.punta, tapable: !e.interior })),
    [etiquetas],
  )
  const cotasVisibles = useVisibles(candidatosCotas, limites, verCotas)
  const etiquetasVisibles = useVisibles(candidatosEtiquetas, limites, verEtiquetas)

  return (
    <group>
      {verCotas && cotas.filter((c) => cotasVisibles.has(c.id)).map((c) => <Cota key={c.id} cota={c} />)}
      {verEtiquetas &&
        defs.map((def, i) => {
          if (!etiquetasVisibles.has(def.id)) return null
          return def.objetivo === 'nivelAgua' ? (
            <EtiquetaNivel key={def.id} datos={datos} def={def} />
          ) : (
            <Etiqueta key={def.id} etiqueta={etiquetas[i]} />
          )
        })}
    </group>
  )
}
