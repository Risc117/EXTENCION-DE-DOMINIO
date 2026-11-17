import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Object3D, PerspectiveCamera, Quaternion, Raycaster, StereoCamera, Vector3, type Scene, type WebGLRenderer } from 'three'
import { CAMARA_FOV } from '../../nucleo/constantes'
import { PASO_PROGRESO_MIRADA, REVISION_MIRADA_S } from '../../nucleo/constantesVR'
import { datosVR } from '../../nucleo/vr/datos'
import { avanzarMirada, claseDeMirada, MIRADA_INICIAL, type EstadoMirada } from '../../nucleo/vr/mirada'
import { cuaternionManual, girarYaw, yawDeCuaternion } from '../../nucleo/vr/orientacion'
import { useSeleccion } from '../../estado/seleccion'
import { useVR } from '../../estado/vr'
import { entorno } from '../../unidades/entorno/datos'
import { alturaNivelada } from '../../unidades/entorno/terrenoNivelado'
import { ventanasEstereo } from './estereo'
import { inicioDeVR } from './inicioVR'
import { puntoEnSuelo } from './suelo'

const [DIRECCION, GIRO, EJE] = [new Vector3(), new Quaternion(), new Vector3()]

/** Pone la cámara en el ojo (posición y orientación). */
function colocarCamara(camara: PerspectiveCamera, x: number, y: number, z: number, q: Quaternion): void {
  camara.position.set(x, y, z)
  camara.quaternion.copy(q)
  camara.updateMatrixWorld()
}

/** Dibuja la escena dos veces, cada ojo en su mitad de la pantalla (sin corregir la distorsión de las lentes). */
function dibujarEstereo(gl: WebGLRenderer, escena: Scene, camara: PerspectiveCamera, estereo: StereoCamera, ancho: number, alto: number): void {
  const [izq, der] = ventanasEstereo(ancho, alto)
  camara.aspect = izq.ancho / izq.alto
  camara.fov = datosVR.campoVision.valor
  camara.updateProjectionMatrix()
  estereo.eyeSep = datosVR.separacionOjos.valor
  estereo.update(camara)
  gl.setScissorTest(true)
  for (const [v, c] of [[izq, estereo.cameraL], [der, estereo.cameraR]] as const) {
    gl.setViewport(v.x, v.y, v.ancho, v.alto)
    gl.setScissor(v.x, v.y, v.ancho, v.alto)
    gl.render(escena, c)
  }
  gl.setScissorTest(false)
}

/** Id de la estructura que toca el rayo de la mirada, o null. */
function unidadMirada(rayo: Raycaster, grupos: Object3D[]): string | null {
  const golpe = rayo.intersectObjects(grupos, true)[0]
  for (let o: Object3D | null = golpe?.object ?? null; o; o = o.parent) if (typeof o.userData.unidad === 'string') return o.userData.unidad
  return null
}

/** VR con el celular: pone la cámara a la altura de los ojos, la gira con el giroscopio (o arrastrando), dibuja las dos mitades y atiende la mira central. */
export function RigVR({ referencia }: { referencia: number }) {
  const inicio = useMemo(() => inicioDeVR(entorno.vias, datosVR.inicio), [])
  const estereo = useMemo(() => new StereoCamera(), [])
  const rayo = useMemo(() => new Raycaster(), [])
  const mirada = useRef<EstadoMirada>(MIRADA_INICIAL)
  const espera = useRef(0)
  const alineado = useRef<number | null>(null)
  const publicado = useRef(-1)
  const suelo = (x: number, z: number) => alturaNivelada(x, -z) - referencia
  const leer = useThree((s) => s.get)
  // Al salir de VR la cámara y la pantalla vuelven a su vista normal.
  useEffect(
    () => () => {
      const { gl, camera, size } = leer()
      if (camera instanceof PerspectiveCamera) {
        camera.fov = CAMARA_FOV
        camera.aspect = size.width / size.height
        camera.updateProjectionMatrix()
      }
      gl.setScissorTest(false)
      gl.setViewport(0, 0, size.width, size.height)
    },
    [leer],
  )

  useFrame(({ gl, scene, camera, size }, dt) => {
    const vr = useVR.getState()
    if (!vr.activo || !(camera instanceof PerspectiveCamera)) return
    const pos = vr.posicion ?? inicio
    // Orientación: el giroscopio, alineado una vez con la entrada de la planta, o la mirada manual desde ahí.
    if (vr.orientacion && alineado.current === null) alineado.current = inicio.yaw - yawDeCuaternion(vr.orientacion)
    const q = vr.orientacion ? girarYaw(vr.orientacion, alineado.current ?? 0) : cuaternionManual(inicio.yaw + vr.yaw, vr.pitch)
    GIRO.set(q[0], q[1], q[2], q[3])
    const ojos = suelo(pos.x, pos.z) + datosVR.alturaOjos.valor
    colocarCamara(camera, pos.x, ojos, pos.z, GIRO)
    dibujarEstereo(gl, scene, camera, estereo, size.width, size.height)

    // La mira se revisa unas 10 veces por segundo.
    espera.current += dt
    if (espera.current < REVISION_MIRADA_S) return
    const transcurrido = espera.current
    espera.current = 0
    DIRECCION.set(0, 0, -1).applyQuaternion(GIRO)
    rayo.set(camera.position, DIRECCION)
    const grupos = scene.children.filter((o) => typeof o.userData.unidad === 'string')
    const unidad = unidadMirada(rayo, grupos)
    const punto = puntoEnSuelo([pos.x, ojos, pos.z], [DIRECCION.x, DIRECCION.y, DIRECCION.z], suelo, datosVR.distanciaMaxima.valor)
    const clave = claseDeMirada([DIRECCION.x, DIRECCION.y, DIRECCION.z], unidad, punto, datosVR.anguloSalir.valor)
    const r = avanzarMirada(mirada.current, clave, transcurrido, datosVR.tiempoMirada.valor, vr.consumirToque())
    mirada.current = r.estado
    const paso = Math.round(r.progreso / PASO_PROGRESO_MIRADA)
    if (paso !== publicado.current) {
      publicado.current = paso
      useVR.setState({ mirada: { clave, progreso: r.progreso } })
    }
    if (!r.disparar || clave === null) return
    if (clave === 'salir') useVR.getState().pedirSalir()
    else if (clave === 'suelo' && punto) {
      EJE.set(punto.x, 0, punto.z)
      useVR.setState({ posicion: { x: EJE.x, z: EJE.z } })
      useSeleccion.getState().seleccionar(null)
    } else if (clave.startsWith('unidad:')) useSeleccion.getState().seleccionar(clave.slice('unidad:'.length))
  }, 1)
  return null
}
