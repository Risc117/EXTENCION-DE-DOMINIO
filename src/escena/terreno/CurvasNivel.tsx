import { useEffect, useMemo } from 'react'
import { BufferAttribute, BufferGeometry } from 'three'
import { leerColor } from '../../nucleo/colores'
import { CALIDAD_CURVAS, ELEVACION_CURVAS } from '../../nucleo/constantes'
import { terreno } from '../../nucleo/terreno'
import { useCalidad } from '../../estado/calidad'
import { useTerreno } from '../../estado/terreno'
import { segmentosCurvas } from './geometriaCurvas'

/** Curvas de nivel dibujadas sobre el terreno (interruptor en el panel de terreno). */
export function CurvasNivel({ referencia }: { referencia: number }) {
  const visibles = useTerreno((s) => s.curvasVisibles)
  const calidad = useCalidad((s) => s.calidad)
  const color = useMemo(() => leerColor('--color-curva-nivel'), [])
  const geometria = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(segmentosCurvas(terreno.curvas, CALIDAD_CURVAS[calidad], referencia, ELEVACION_CURVAS), 3))
    return g
  }, [calidad, referencia])
  useEffect(() => () => geometria.dispose(), [geometria])
  return (
    <lineSegments geometry={geometria} visible={visibles}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}
