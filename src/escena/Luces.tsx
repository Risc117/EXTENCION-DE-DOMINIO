import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AmbientLight, BufferAttribute, BufferGeometry, Color, DirectionalLight, Points, PointsMaterial, type Scene } from 'three'
import { leerColor } from '../nucleo/colores'
import { DISTANCIA_SOL, ESTRELLAS, MAPA_SOMBRAS, SEMILADO_SOMBRAS } from '../nucleo/constantesSolar'
import { CERCA_SOMBRAS, ELEVACION_MINIMA_LUZ_SOL, FACTOR_LEJOS_SOMBRAS, GENERADOR_ESTRELLAS, FRACCION_CIELO_ESTRELLAS, FRACCION_FAR_ESTRELLAS, LUZ_SOL, SEMILLA_ESTRELLAS, SESGO_SOMBRA, TAMANO_ESTRELLA } from '../nucleo/constantesAmbiente'
import { direccionAlSol, luzDelDia } from '../nucleo/solar'
import { useCalidad } from '../estado/calidad'
import { ambiente } from '../unidades/ambiente/datos'
import { solActual } from '../unidades/ambiente/sol'

/** Estrellas repartidas por la mitad de arriba del cielo, con una semilla fija (sin azar) para que sean siempre las mismas. */
function posicionesEstrellas(n: number, radio: number): Float32Array {
  const p = new Float32Array(n * 3)
  let s = SEMILLA_ESTRELLAS
  const siguiente = () => {
    s = (s * GENERADOR_ESTRELLAS.multiplicador + GENERADOR_ESTRELLAS.incremento) % GENERADOR_ESTRELLAS.modulo
    return s / GENERADOR_ESTRELLAS.modulo
  }
  for (let i = 0; i < n; i++) {
    const [u, v] = [siguiente(), siguiente()]
    const [az, el] = [u * Math.PI * 2, Math.asin(v * FRACCION_CIELO_ESTRELLAS)]
    p.set([radio * Math.cos(el) * Math.cos(az), radio * Math.sin(el), radio * Math.cos(el) * Math.sin(az)], i * 3)
  }
  return p
}

/** Pone la luz del sol en su lugar (a DISTANCIA_SOL del objetivo, hacia el sol), con su intensidad y su color (de luna a sol). */
function apuntarSol(l: DirectionalLight, objetivo: [number, number, number], v: [number, number, number], intensidad: number, luna: Color, sol: Color, mezcla: number): void {
  l.position.set(objetivo[0] + v[0] * DISTANCIA_SOL, Math.max(v[1], ELEVACION_MINIMA_LUZ_SOL) * DISTANCIA_SOL, objetivo[2] + v[2] * DISTANCIA_SOL)
  l.target.position.set(objetivo[0], objetivo[1], objetivo[2])
  l.target.updateMatrixWorld()
  l.intensity = intensidad
  l.color.copy(luna).lerp(sol, mezcla)
}

/** Intensidad de una luz ambiente. */
function ajustar(l: AmbientLight, intensidad: number): void {
  l.intensity = intensidad
}

/** Fondo de la escena: del color de la noche al del día. */
function pintarCielo(scene: Scene, noche: Color, dia: Color, mezcla: number): void {
  const fondo = scene.background instanceof Color ? scene.background : new Color()
  scene.background = fondo.copy(noche).lerp(dia, mezcla)
}

/** Las estrellas se ven más cuanto más oscuro está el cielo. */
function ajustarEstrellas(m: PointsMaterial, p: Points, visibilidad: number): void {
  m.opacity = visibilidad
  p.visible = visibilidad > 0
}

/** Sol, luz ambiente, color del cielo, estrellas y sombras según la hora (la simulación o la fijada) y la latitud. Las sombras solo en calidad alta. */
export function Luces({ objetivo }: { objetivo: [number, number, number] }) {
  const calidad = useCalidad((s) => s.calidad)
  const { scene, camera } = useThree()
  const sol = useRef<DirectionalLight>(null)
  const ambiental = useRef<AmbientLight>(null)
  const colores = useMemo(() => ({ dia: new Color(leerColor('--color-cielo-dia')), noche: new Color(leerColor('--color-cielo-noche')), sol: new Color(leerColor('--color-sol')), luna: new Color(leerColor('--color-luna')) }), [])
  const estrellas = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(posicionesEstrellas(ESTRELLAS[calidad], (camera as { far: number }).far * FRACCION_FAR_ESTRELLAS), 3))
    return g
  }, [calidad, camera])
  const material = useMemo(() => new PointsMaterial({ color: leerColor('--color-estrella'), size: TAMANO_ESTRELLA, sizeAttenuation: false, transparent: true, depthWrite: false, fog: false }), [])
  const puntos = useMemo(() => {
    const p = new Points(estrellas, material)
    p.frustumCulled = false
    p.renderOrder = -1
    return p
  }, [estrellas, material])
  useEffect(() => () => estrellas.dispose(), [estrellas])
  useEffect(() => () => material.dispose(), [material])

  const sombras = calidad === 'alta' && MAPA_SOMBRAS.alta > 0
  useFrame(() => {
    const s = solActual()
    const luz = luzDelDia(s.elevacion)
    const v = direccionAlSol(s, ambiente.giroNorte.valor)
    if (sol.current) apuntarSol(sol.current, objetivo, v, luz.sol * LUZ_SOL, colores.luna, colores.sol, luz.sol)
    if (ambiental.current) ajustar(ambiental.current, luz.ambiente)
    pintarCielo(scene, colores.noche, colores.dia, luz.dia)
    ajustarEstrellas(material, puntos, luz.estrellas)
  })
  return (
    <>
      <ambientLight ref={ambiental} />
      <directionalLight
        ref={sol}
        castShadow={sombras}
        shadow-mapSize={[MAPA_SOMBRAS.alta, MAPA_SOMBRAS.alta]}
        shadow-camera-left={-SEMILADO_SOMBRAS}
        shadow-camera-right={SEMILADO_SOMBRAS}
        shadow-camera-top={SEMILADO_SOMBRAS}
        shadow-camera-bottom={-SEMILADO_SOMBRAS}
        shadow-camera-near={CERCA_SOMBRAS}
        shadow-camera-far={DISTANCIA_SOL * FACTOR_LEJOS_SOMBRAS}
        shadow-bias={SESGO_SOMBRA}
      />
      <primitive object={puntos} />
    </>
  )
}
