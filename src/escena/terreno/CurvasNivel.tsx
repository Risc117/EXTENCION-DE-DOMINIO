import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { BufferAttribute, BufferGeometry, type LineSegments } from 'three'
import { leerColor } from '../../nucleo/colores'
import { CURVAS_DETALLE, CURVAS_PRINCIPALES, ELEVACION_CURVAS, terreno } from '../../nucleo/terreno'
import { useEstado } from '../../estado/almacen'
import { useTerreno } from '../../estado/terreno'
import type { Unidad } from '../../unidades/tipos'
import { hayDetalleCurvas, radioCamara } from './detalleCurvas'
import { segmentosCurvas } from './geometriaCurvas'
import { terrenoModificado } from './superficie'
import { ventanaVisible } from './ventana'

function crearGeometria(tipos: readonly string[], referencia: number): BufferGeometry {
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(segmentosCurvas(terreno.curvas, tipos, referencia, ELEVACION_CURVAS, terrenoModificado, ventanaVisible()), 3))
  return g
}

/** Curvas de nivel sobre el terreno: las de 5 m siempre, las de 1 m solo con la cámara cerca (interruptor en el panel de terreno). */
export function CurvasNivel({ referencia, unidades }: { referencia: number; unidades: Unidad[] }) {
  const visibles = useTerreno((s) => s.curvasVisibles)
  const color = useMemo(() => leerColor('--color-curva-nivel'), [])
  const principales = useMemo(() => crearGeometria(CURVAS_PRINCIPALES, referencia), [referencia])
  const detalle = useMemo(() => crearGeometria(CURVAS_DETALLE, referencia), [referencia])
  const lineas = useRef<LineSegments>(null)
  useEffect(() => () => principales.dispose(), [principales])
  useEffect(() => () => detalle.dispose(), [detalle])
  useFrame(() => {
    const { camara, foco } = useEstado.getState()
    if (lineas.current) lineas.current.visible = useTerreno.getState().curvasVisibles && hayDetalleCurvas(radioCamara(unidades, foco, camara.distancia))
  })
  return (
    <>
      <lineSegments geometry={principales} visible={visibles}>
        <lineBasicMaterial color={color} />
      </lineSegments>
      <lineSegments ref={lineas} geometry={detalle} visible={false}>
        <lineBasicMaterial color={color} />
      </lineSegments>
    </>
  )
}
