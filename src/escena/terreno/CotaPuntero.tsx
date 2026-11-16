import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Vector2 } from 'three'
import { ALCANCE_RAYO_TERRENO, INTERVALO_COTA_MS } from '../../nucleo/constantes'
import { cuadricula, rayoContraTerreno, terreno } from '../../nucleo/terreno'
import { useTerreno } from '../../estado/terreno'

/** Calcula la cota del terreno bajo el mouse y la deja en el estado (la interfaz la muestra). */
export function CotaPuntero({ referencia }: { referencia: number }) {
  const { gl, camera, raycaster } = useThree()
  const malla = useMemo(() => cuadricula(terreno), [])
  const fijar = useTerreno((s) => s.fijarPuntero)
  const mouse = useRef<Vector2 | null>(null)
  const ultimo = useRef(0)
  const sucio = useRef(false)

  useEffect(() => {
    const el = gl.domElement
    const mover = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      mouse.current = new Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      sucio.current = true
    }
    const salir = () => {
      mouse.current = null
      sucio.current = true
    }
    el.addEventListener('pointermove', mover)
    el.addEventListener('pointerleave', salir)
    return () => {
      el.removeEventListener('pointermove', mover)
      el.removeEventListener('pointerleave', salir)
      fijar(null)
    }
  }, [gl, fijar])

  useFrame(() => {
    const ahora = performance.now()
    if (!sucio.current || ahora - ultimo.current < INTERVALO_COTA_MS) return
    ultimo.current = ahora
    sucio.current = false
    if (!mouse.current) return fijar(null)
    raycaster.setFromCamera(mouse.current, camera)
    const { origin: o, direction: d } = raycaster.ray
    fijar(rayoContraTerreno(malla, referencia, [o.x, o.y, o.z], [d.x, d.y, d.z], ALCANCE_RAYO_TERRENO))
  })
  return null
}
