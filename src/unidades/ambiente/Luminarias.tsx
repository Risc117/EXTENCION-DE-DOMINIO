import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { leerColor } from '../../nucleo/colores'
import { ALTURA_CIRCULO_LUZ, BRILLO_LAMPARA, OPACIDAD_CIRCULO_LUZ, RADIO_LAMPARA_RELATIVO, SEGMENTOS_CIRCULO_LUZ, SEGMENTOS_LUMINARIA } from '../../nucleo/constantesAmbiente'
import { lucesEncendidas } from '../../nucleo/solar'
import { alturaTerreno } from '../comun/terrenoPlanta'
import { ambiente } from './datos'
import { solActual } from './sol'

/** Las 7 luminarias del plano: poste, lámpara y círculo de luz en el suelo, encendidos cuando el sol está bajo el horizonte. */
export function Luminarias({ referencia }: { referencia: number }) {
  const l = ambiente.luminarias
  const [poste, lampara, luz] = useMemo(() => ['--color-muro', '--color-lampara', '--color-lampara'].map(leerColor), [])
  const puntos = useMemo(() => l.puntos.map((p) => ({ ...p, suelo: alturaTerreno(p.x, p.y) - referencia })), [l.puntos, referencia])
  const grupo = useRef<Group>(null)
  useFrame(() => {
    const g = grupo.current
    if (!g) return
    const encendidas = lucesEncendidas(solActual().elevacion)
    g.children.forEach((poste) => {
      const [bombilla, circulo] = [poste.children[1], poste.children[2]]
      bombilla.visible = encendidas
      circulo.visible = encendidas
    })
  })
  return (
    <group ref={grupo}>
      {puntos.map((p, i) => (
        <group key={i} position={[p.x, p.suelo, -p.y]}>
          <mesh position={[0, l.alturaPoste.valor / 2, 0]}>
            <cylinderGeometry args={[l.radioPoste.valor, l.radioPoste.valor, l.alturaPoste.valor, SEGMENTOS_LUMINARIA]} />
            <meshStandardMaterial color={poste} />
          </mesh>
          <mesh position={[0, l.alturaPoste.valor, 0]} visible={false}>
            <sphereGeometry args={[l.radioPoste.valor * RADIO_LAMPARA_RELATIVO, SEGMENTOS_LUMINARIA, SEGMENTOS_LUMINARIA]} />
            <meshStandardMaterial color={lampara} emissive={lampara} emissiveIntensity={BRILLO_LAMPARA} />
          </mesh>
          <mesh position={[0, ALTURA_CIRCULO_LUZ, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
            <circleGeometry args={[l.radioLuz.valor, SEGMENTOS_CIRCULO_LUZ]} />
            <meshBasicMaterial color={luz} transparent opacity={OPACIDAD_CIRCULO_LUZ} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
