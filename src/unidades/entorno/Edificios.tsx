import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useState } from 'react'
import { leerColor } from '../../nucleo/colores'
import { DESFASE_ET_EDIFICIO, DISTANCIA_ETIQUETA_ENTORNO, ENTERRADO_BASE } from '../../nucleo/constantesEntorno'
import { useAnotaciones } from '../../estado/anotaciones'
import { alturaNivelada } from './terrenoNivelado'
import { etiquetaDe } from '../comun/anotar'
import { etiquetasCercanas } from '../comun/cercania'
import { Etiqueta } from '../comun/Etiqueta'
import { entorno } from './datos'
import { cotasBase } from './geometria'
import { Losa } from '../comun/Losa'

/** Edificios del plano como prismas sobre su planta, apoyados en el terreno, con su nombre al acercarse. */
export function Edificios({ referencia }: { referencia: number }) {
  const color = useMemo(() => leerColor('--color-edificio'), [])
  const verEtiquetas = useAnotaciones((s) => s.etiquetas)
  const deLejos = useAnotaciones((s) => s.siempre)
  const camara = useThree((s) => s.camera)
  const [cercanas, setCercanas] = useState('')
  const piezas = useMemo(
    () =>
      entorno.edificios.map((e) => {
        // El piso es la cota de su plataforma (datos/entorno.json); las paredes bajan hasta el terreno más bajo bajo la planta.
        const piso = e.cotaPiso.valor
        const base = Math.min(piso, cotasBase(e.poligono, alturaNivelada).base)
        const techo = piso + e.altura.valor
        const cx = e.poligono.reduce((s, p) => s + p.x, 0) / e.poligono.length
        const cy = e.poligono.reduce((s, p) => s + p.y, 0) / e.poligono.length
        return {
          e,
          base: base - ENTERRADO_BASE - referencia,
          alto: techo - base + ENTERRADO_BASE,
          etiqueta: etiquetaDe(`et-${e.id}`, e.nombre, e.altura.demo === true, [cx, techo - referencia, -cy], DESFASE_ET_EDIFICIO),
        }
      }),
    [referencia],
  )
  useFrame(() => {
    const ids = etiquetasCercanas([camara.position.x, camara.position.y, camara.position.z], piezas.map((p) => p.etiqueta), deLejos ? Infinity : DISTANCIA_ETIQUETA_ENTORNO)
      .map((x) => x.id)
      .join('|')
    if (ids !== cercanas) setCercanas(ids)
  })
  return (
    <group>
      {piezas.map((p) => (
        <Losa key={p.e.id} poligono={p.e.poligono} base={p.base} alto={p.alto} color={color} />
      ))}
      {verEtiquetas && piezas.filter((p) => cercanas.split('|').includes(p.etiqueta.id)).map((p) => <Etiqueta key={p.etiqueta.id} etiqueta={p.etiqueta} />)}
    </group>
  )
}
