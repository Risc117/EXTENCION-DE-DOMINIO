import { useVR } from '../../estado/vr'
import { CABECEO_MAXIMO, RADIANES_POR_PIXEL_ARRASTRE } from '../../nucleo/constantesVR'
import { cuaternionDeDispositivo } from '../../nucleo/vr/orientacion'

interface EventoOrientacion extends Event {
  alpha: number | null
  beta: number | null
  gamma: number | null
}

type ConPermiso = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> }

/** Giro de la pantalla (0, 90, 270): el celular en horizontal dentro del visor. */
const anguloPantalla = (): number => screen.orientation?.angle ?? (window as unknown as { orientation?: number }).orientation ?? 0

/** Pide permiso del giroscopio (hace falta en iPhone; debe llamarse al tocar un botón). true si se puede seguir. */
export async function pedirPermisoGiroscopio(): Promise<boolean> {
  const clase = (globalThis as { DeviceOrientationEvent?: ConPermiso }).DeviceOrientationEvent
  if (!clase?.requestPermission) return true
  try {
    return (await clase.requestPermission()) === 'granted'
  } catch {
    return false
  }
}

/** Empieza a leer el giroscopio y lo guarda como orientación de la cámara. Devuelve la función que lo apaga. */
export function escucharGiroscopio(): () => void {
  const alRecibir = (e: Event) => {
    const { alpha, beta, gamma } = e as EventoOrientacion
    if (alpha === null || beta === null || gamma === null) return
    useVR.setState({ orientacion: cuaternionDeDispositivo(alpha, beta, gamma, anguloPantalla()) })
  }
  window.addEventListener('deviceorientation', alRecibir)
  return () => window.removeEventListener('deviceorientation', alRecibir)
}

/** Mirar arrastrando (sin giroscopio): mover el dedo `dx`, `dy` píxeles gira y cabecea la mirada. */
export function mirarArrastrando(dx: number, dy: number): void {
  const { yaw, pitch } = useVR.getState()
  useVR.setState({ yaw: yaw + dx * RADIANES_POR_PIXEL_ARRASTRE, pitch: Math.max(-CABECEO_MAXIMO, Math.min(CABECEO_MAXIMO, pitch + dy * RADIANES_POR_PIXEL_ARRASTRE)) })
}

/** Pantalla completa y horizontal, si el navegador lo permite (si no, sigue igual). */
export async function prepararPantalla(): Promise<void> {
  try {
    await document.documentElement.requestFullscreen?.()
    await (screen.orientation as { lock?: (o: string) => Promise<void> } | undefined)?.lock?.('landscape')
  } catch {
    // el navegador no lo permite: se sigue sin pantalla completa
  }
}

/** Devuelve la pantalla a como estaba. */
export function soltarPantalla(): void {
  try {
    screen.orientation?.unlock?.()
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
  } catch {
    // nada que devolver
  }
}

let apagarGiroscopio: (() => void) | null = null
let entrando = false

/** Entra a VR: pide el giroscopio, pone la pantalla completa y activa el modo. Se llama al tocar el botón "VR". */
export async function entrarVR(): Promise<void> {
  if (useVR.getState().activo || entrando) return
  entrando = true
  try {
    await pedirPermisoGiroscopio()
    apagarGiroscopio = escucharGiroscopio()
    await prepararPantalla()
    document.addEventListener('fullscreenchange', alCambiarPantalla)
    useVR.getState().entrar()
  } finally {
    entrando = false
  }
}

/** Si se sale de la pantalla completa con el gesto del sistema, también se sale de VR. */
function alCambiarPantalla(): void {
  if (!document.fullscreenElement && useVR.getState().activo) salirVR()
}

/** Sale de VR: apaga el giroscopio, devuelve la pantalla y la calidad. */
export function salirVR(): void {
  document.removeEventListener('fullscreenchange', alCambiarPantalla)
  apagarGiroscopio?.()
  apagarGiroscopio = null
  soltarPantalla()
  useVR.getState().salir()
}
