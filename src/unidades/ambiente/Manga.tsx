import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { leerColor } from '../../nucleo/colores'
import { SEGMENTOS_MANGA } from '../../nucleo/constantesAmbiente'
import { GRADOS_MEDIA_VUELTA } from '../../nucleo/constantesViento'
import { elevacionManga } from '../../nucleo/viento'
import { useViento } from '../../estado/viento'
import { alturaTerreno } from '../comun/terrenoPlanta'
import { ambiente } from './datos'

const RAD = Math.PI / GRADOS_MEDIA_VUELTA

/** Orienta la manga: gira hacia donde sopla el viento y se levanta según su velocidad (cuelga con calma, horizontal con viento fuerte). */
function orientarManga(g: Group, haciaX: number, haciaZ: number, velocidad: number): void {
  g.rotation.y = Math.atan2(-haciaZ, haciaX)
  g.rotation.z = -elevacionManga(velocidad) * RAD
}

/** Manga de viento junto al quemador (de ejemplo): poste y cono que se orientan y se estiran con el viento. */
export function Manga({ referencia }: { referencia: number }) {
  const m = ambiente.manga
  const [poste, tela] = useMemo(() => ['--color-muro', '--color-manga'].map(leerColor), [])
  const suelo = alturaTerreno(m.posicion.x, m.posicion.y) - referencia
  const cuerpo = useRef<Group>(null)
  useFrame(() => {
    const v = useViento.getState()
    if (cuerpo.current) orientarManga(cuerpo.current, v.haciaX, v.haciaZ, v.velocidad)
  })
  return (
    <group position={[m.posicion.x, suelo, -m.posicion.y]}>
      <mesh position={[0, m.alturaPoste.valor / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, m.alturaPoste.valor, SEGMENTOS_MANGA]} />
        <meshStandardMaterial color={poste} />
      </mesh>
      <group ref={cuerpo} position={[0, m.alturaPoste.valor, 0]}>
        <mesh position={[m.largo.valor / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[m.radio.valor * 0.35, m.radio.valor, m.largo.valor, SEGMENTOS_MANGA, 1, true]} />
          <meshStandardMaterial color={tela} side={2} />
        </mesh>
      </group>
    </group>
  )
}
