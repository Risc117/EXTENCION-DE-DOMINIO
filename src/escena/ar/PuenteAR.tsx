import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Matrix4, Mesh, Object3D, PerspectiveCamera, Raycaster, Vector3, type WebGLRenderer } from 'three'
import { leerColor } from '../../nucleo/colores'
import { datosAR } from '../../nucleo/ar/datos'
import { posicionDeMatriz, rayoDeMatriz } from '../../nucleo/ar/hit'
import { useAR } from '../../estado/ar'
import { useSeleccion } from '../../estado/seleccion'

const [ORIGEN, DIRECCION, MATRIZ] = [new Vector3(), new Vector3(), new Matrix4()]

/** Estructuras de la escena (los grupos con userData.unidad), estén donde estén. */
function gruposDeUnidades(escena: Object3D): Object3D[] {
  const lista: Object3D[] = []
  escena.traverse((o) => {
    if (typeof o.userData.unidad === 'string') lista.push(o)
  })
  return lista
}

/** Id de la estructura que toca un rayo (origen y dirección en el mundo de AR), o null. */
function unidadTocada(escena: Object3D, rayo: Raycaster): string | null {
  const golpe = rayo.intersectObjects(gruposDeUnidades(escena), true)[0]
  for (let o: Object3D | null = golpe?.object ?? null; o; o = o.parent) if (typeof o.userData.unidad === 'string') return o.userData.unidad
  return null
}

/** Ajusta los planos de recorte de la cámara (la maqueta es pequeña y se ve de cerca). */
function ajustarPlanos(camara: PerspectiveCamera, cerca: number, lejos: number): void {
  camara.near = cerca
  camara.far = lejos
  camara.updateProjectionMatrix()
}

/** Enciende o apaga el modo XR del renderizador. */
function modoXR(gl: WebGLRenderer, activo: boolean): void {
  gl.xr.enabled = activo
}

/** Pone el anillo de la superficie en el punto del impacto, apoyado en el piso. */
function ponerAnillo(anillo: Mesh, m: ArrayLike<number>): void {
  MATRIZ.fromArray(Array.from(m))
  anillo.position.setFromMatrixPosition(MATRIZ)
}

/**
 * Conecta la sesión de AR con el dibujo: usa el modo XR del renderizador, busca superficies (hit-test) y muestra un anillo donde se puede colocar;
 * un toque coloca la maqueta y, ya colocada, un toque sobre una estructura abre su tarjeta. Solo se monta mientras hay una sesión de AR.
 */
export function PuenteAR() {
  const { gl, scene, camera } = useThree()
  const sesion = useAR((s) => s.sesion)
  const fase = useAR((s) => s.fase)
  const fuente = useRef<XRHitTestSource | null>(null)
  const ultimo = useRef<[number, number, number] | null>(null)
  const anillo = useRef<Mesh>(null)
  const rayo = useMemo(() => new Raycaster(), [])
  const color = useMemo(() => leerColor('--color-calidad-ok'), [])

  useEffect(() => {
    if (!sesion) return
    const marca = { cancelado: false }
    const camara = camera instanceof PerspectiveCamera ? camera : null
    const [cerca, lejos] = [camara?.near ?? 0, camara?.far ?? 0]
    if (camara) ajustarPlanos(camara, datosAR.planoCercano.valor, datosAR.planoLejano.valor)
    modoXR(gl, true)
    void gl.xr.setSession(sesion)
    sesion
      .requestReferenceSpace('viewer')
      .then((espacio) => sesion.requestHitTestSource?.({ space: espacio }))
      .then((origen) => {
        if (marca.cancelado) origen?.cancel()
        else fuente.current = origen ?? null
      })
      .catch(() => undefined)
    const alTocar = (e: XRInputSourceEvent) => {
      const estado = useAR.getState()
      if (estado.fase === 'lista' && ultimo.current) estado.colocar(ultimo.current)
      else if (estado.fase === 'colocada') {
        const pose = e.frame.getPose(e.inputSource.targetRaySpace, gl.xr.getReferenceSpace() as XRReferenceSpace)
        if (!pose) return
        const r = rayoDeMatriz(pose.transform.matrix)
        rayo.set(ORIGEN.set(...r.origen), DIRECCION.set(...r.direccion))
        useSeleccion.getState().seleccionar(unidadTocada(scene, rayo))
      }
    }
    sesion.addEventListener('select', alTocar)
    return () => {
      marca.cancelado = true
      fuente.current?.cancel()
      fuente.current = null
      sesion.removeEventListener('select', alTocar)
      modoXR(gl, false)
      if (camara) ajustarPlanos(camara, cerca, lejos)
    }
  }, [sesion, gl, camera, scene, rayo])

  useFrame((_, __, frame) => {
    if (!frame || !fuente.current || useAR.getState().fase === 'colocada') return
    const impacto = frame.getHitTestResults(fuente.current)[0]
    const pose = impacto?.getPose(gl.xr.getReferenceSpace() as XRReferenceSpace)
    if (!pose) {
      ultimo.current = null
      useAR.getState().evento('sinSuperficie')
      return
    }
    ultimo.current = posicionDeMatriz(pose.transform.matrix)
    if (anillo.current) ponerAnillo(anillo.current, pose.transform.matrix)
    useAR.getState().evento('superficie')
  })

  return (
    <mesh ref={anillo} rotation={[-Math.PI / 2, 0, 0]} visible={fase === 'lista'}>
      <ringGeometry args={[0.07, 0.09, 32]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}
