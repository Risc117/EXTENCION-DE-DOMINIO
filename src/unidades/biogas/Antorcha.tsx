import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { leerColor } from '../../nucleo/colores'
import { ALTO_LLAMA_INTERIOR, ELEVACION_RADIO_BIOGAS, ENTERRADO_RECINTO, ESCALA_MINIMA_LLAMA, GROSOR_RADIO_SEGURIDAD, OPACIDAD_LLAMA, PARPADEO_LLAMA, RADIO_LLAMA, RADIO_LLAMA_INTERIOR, SEGMENTOS_BIOGAS, SEGMENTOS_CIRCULO_BIOGAS } from '../../nucleo/constantesBiogas'
import { useLodosBiogas } from '../../estado/lodosBiogas'
import { Losa } from '../comun/Losa'
import { alturaTerreno } from '../comun/terrenoPlanta'
import type { Vec3 } from '../comun/tiposAnotaciones'
import { biogas } from './datos'
import { escalaLlama } from './geometria'

/** Antorcha de biogás: chimenea, recinto, radio de seguridad y llama que crece con el biogás que produce el RAFA (la llama es ilustrativa). */
export function Antorcha({ referencia }: { referencia: number }) {
  const a = biogas.antorcha
  const [acero, llama, nucleo, seguridad] = useMemo(() => ['--color-muro', '--color-llama', '--color-llama-nucleo', '--color-radio-seguridad'].map(leerColor), [])
  const suelo = alturaTerreno(a.centro.x, a.centro.y) - referencia
  const anillo = useMemo(
    () =>
      Array.from({ length: SEGMENTOS_CIRCULO_BIOGAS + 1 }, (_, i): Vec3 => {
        const t = ((i % SEGMENTOS_CIRCULO_BIOGAS) / SEGMENTOS_CIRCULO_BIOGAS) * Math.PI * 2
        const [x, y] = [a.centro.x + Math.cos(t) * a.radioSeguridad.valor, a.centro.y + Math.sin(t) * a.radioSeguridad.valor]
        return [x, alturaTerreno(x, y) - referencia + ELEVACION_RADIO_BIOGAS, -y]
      }),
    [a, referencia],
  )
  const fuego = useRef<Group>(null)
  useFrame(({ clock }) => {
    const g = fuego.current
    if (!g) return
    const { produccion, datos } = useLodosBiogas.getState()
    const escala = produccion && datos ? escalaLlama(produccion.biogasM3h, datos.biogasDisenoM3h) : 0
    const t = clock.elapsedTime
    const parpadeo = 1 + PARPADEO_LLAMA.amplitudes.reduce((s, amp, i) => s + amp * Math.sin(t * PARPADEO_LLAMA.frecuencias[i]), 0)
    g.visible = escala > 0
    g.scale.set(1, Math.max(escala * parpadeo, ESCALA_MINIMA_LLAMA), 1)
  })
  const alto = a.alturaChimenea.valor
  const altoLlama = a.llama.alturaMaxima.valor
  return (
    <group>
      <Losa poligono={a.recinto.poligono} base={suelo - ENTERRADO_RECINTO} alto={ENTERRADO_RECINTO + a.recinto.altura.valor} color={acero} />
      <mesh position={[a.centro.x, suelo + alto / 2, -a.centro.y]}>
        <cylinderGeometry args={[a.radioChimenea.valor, a.radioChimenea.valor, alto, SEGMENTOS_BIOGAS]} />
        <meshStandardMaterial color={acero} />
      </mesh>
      <group ref={fuego} position={[a.centro.x, suelo + alto, -a.centro.y]}>
        <mesh position={[0, altoLlama / 2, 0]}>
          <coneGeometry args={[RADIO_LLAMA, altoLlama, SEGMENTOS_BIOGAS]} />
          <meshBasicMaterial color={llama} transparent opacity={OPACIDAD_LLAMA} />
        </mesh>
        <mesh position={[0, (altoLlama * ALTO_LLAMA_INTERIOR) / 2, 0]}>
          <coneGeometry args={[RADIO_LLAMA * RADIO_LLAMA_INTERIOR, altoLlama * ALTO_LLAMA_INTERIOR, SEGMENTOS_BIOGAS]} />
          <meshBasicMaterial color={nucleo} />
        </mesh>
      </group>
      <Line points={anillo} color={seguridad} lineWidth={GROSOR_RADIO_SEGURIDAD} />
    </group>
  )
}
