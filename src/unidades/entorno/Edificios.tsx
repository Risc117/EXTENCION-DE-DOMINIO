import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useState } from 'react'
import { leerColor } from '../../nucleo/colores'
import { DESFASE_ET_EDIFICIO, DISTANCIA_ETIQUETA_ENTORNO } from '../../nucleo/constantesEntorno'
import { useAnotaciones } from '../../estado/anotaciones'
import { etiquetaDe } from '../comun/anotar'
import { etiquetasCercanas } from '../comun/cercania'
import { Etiqueta } from '../comun/Etiqueta'
import { entorno } from './datos'
import { bloqueEdificio } from './nivelacion'
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
        // El edificio arranca en su piso (la cota de su plataforma, datos/entorno.json): solo una cimentación enterrada, sin paredes de relleno.
        const piso = e.cotaPiso.valor
        const techo = piso + e.altura.valor
        const bloque = bloqueEdificio(piso, e.altura.valor)
        const cx = e.poligono.reduce((s, p) => s + p.x, 0) / e.poligono.length
        const cy = e.poligono.reduce((s, p) => s + p.y, 0) / e.poligono.length
        return {
          e,
          base: bloque.base - referencia,
          alto: bloque.alto,
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
