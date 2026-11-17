import { HandLandmarker } from '@mediapipe/tasks-vision'
import { CAMARA_ALTO, CAMARA_ANCHO, RUTA_MODELO_MANO, RUTA_WASM_BINARIO, RUTA_WASM_CARGADOR } from '../nucleo/constantes'
import { useEstado } from '../estado/almacen'
import { interpretar, type Memoria } from './gestos/interpretar'

/** Enciende la webcam, lee la mano en cada cuadro y emite intenciones. Devuelve la función que lo apaga. */
export async function iniciarMano(): Promise<() => void> {
  const estado = useEstado.getState()
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.srcObject = await navigator.mediaDevices.getUserMedia({
    video: { width: CAMARA_ANCHO, height: CAMARA_ALTO, facingMode: 'user' },
  })
  const detenerCamara = () => (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop())

  let detector: HandLandmarker
  try {
    await video.play()
    detector = await HandLandmarker.createFromOptions(
      { wasmLoaderPath: RUTA_WASM_CARGADOR, wasmBinaryPath: RUTA_WASM_BINARIO },
      { baseOptions: { modelAssetPath: RUTA_MODELO_MANO }, runningMode: 'VIDEO', numHands: 1 },
    )
  } catch (e) {
    detenerCamara()
    throw e
  }

  let memoria: Memoria | null = null
  let detectada = false
  let ultimoVideo = -1
  let marco = 0
  const cuadro = () => {
    marco = requestAnimationFrame(cuadro)
    if (video.readyState < 2 || video.currentTime === ultimoVideo) return
    ultimoVideo = video.currentTime
    const puntos = detector.detectForVideo(video, performance.now()).landmarks[0] ?? null
    const r = interpretar(memoria, puntos, useEstado.getState().ajusteGestos)
    memoria = r.memoria
    const s = useEstado.getState()
    if (r.detectada !== detectada) {
      detectada = r.detectada
      s.fijarManoDetectada(detectada)
    }
    if (r.giro.acimut !== 0 || r.giro.elevacion !== 0) s.girar(r.giro.acimut, r.giro.elevacion)
    if (r.zoom !== 1) s.hacerZoom(r.zoom)
    if (r.orden) s.irAVecina(r.orden)
    if (s.pausado !== r.pausa) s.fijarPausa(r.pausa)
  }
  marco = requestAnimationFrame(cuadro)
  estado.fijarGestos('activo')

  return () => {
    cancelAnimationFrame(marco)
    detector.close()
    detenerCamara()
    useEstado.getState().fijarGestos('apagado')
  }
}
