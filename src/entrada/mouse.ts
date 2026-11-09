import { GIRO_MOUSE, ZOOM_RUEDA } from '../nucleo/constantes'
import { useEstado } from '../estado/almacen'

/** Arrastrar a la derecha mueve la cámara a la izquierda, como si se agarrara el tanque. */
export function giroPorArrastre(dx: number, dy: number) {
  return { acimut: -dx * GIRO_MOUSE, elevacion: dy * GIRO_MOUSE }
}

/** Rueda hacia adelante (deltaY negativo) acerca; hacia atrás aleja. */
export function factorRueda(deltaY: number): number {
  return Math.exp(deltaY * ZOOM_RUEDA)
}

const esLienzo = (e: Event) => e.target instanceof HTMLCanvasElement

/** Escucha el mouse sobre el lienzo y emite intenciones. Devuelve la función que lo desconecta. */
export function iniciarMouse(): () => void {
  let arrastrando = false
  const abajo = (e: PointerEvent) => {
    if (esLienzo(e)) arrastrando = true
  }
  const arriba = () => {
    arrastrando = false
  }
  const mover = (e: PointerEvent) => {
    if (!arrastrando) return
    const g = giroPorArrastre(e.movementX, e.movementY)
    useEstado.getState().girar(g.acimut, g.elevacion)
  }
  const rueda = (e: WheelEvent) => {
    if (!esLienzo(e)) return
    e.preventDefault()
    useEstado.getState().hacerZoom(factorRueda(e.deltaY))
  }
  window.addEventListener('pointerdown', abajo)
  window.addEventListener('pointerup', arriba)
  window.addEventListener('pointercancel', arriba)
  window.addEventListener('pointermove', mover)
  window.addEventListener('wheel', rueda, { passive: false })
  return () => {
    window.removeEventListener('pointerdown', abajo)
    window.removeEventListener('pointerup', arriba)
    window.removeEventListener('pointercancel', arriba)
    window.removeEventListener('pointermove', mover)
    window.removeEventListener('wheel', rueda)
  }
}
