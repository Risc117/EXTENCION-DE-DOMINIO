import { create } from 'zustand'
import type { Cuaternion } from '../nucleo/vr/orientacion'
import { useCalidad } from './calidad'
import type { Calidad } from './preferenciaCalidad'

interface EstadoVR {
  activo: boolean
  /** Calidad que había al entrar, para devolverla al salir (sin tocar la preferencia guardada). */
  calidadPrevia: Calidad | null
  /** Dónde está la persona (m, ejes de la escena); null = en la entrada de la planta. */
  posicion: { x: number; z: number } | null
  /** Orientación del giroscopio; null mientras no llega ningún dato (se mira arrastrando). */
  orientacion: Cuaternion | null
  /** Mirada manual (radianes): giro a la izquierda y cabeceo hacia arriba. */
  yaw: number
  pitch: number
  /** Lo que se mira y cuánto falta para actuar (la interfaz dibuja el anillo). */
  mirada: { clave: string | null; progreso: number }
  /** Un toque de pantalla pendiente (el botón del visor). */
  tocado: boolean
  /** La mira pidió salir (mirar hacia los pies); la raíz lo atiende y devuelve la pantalla. */
  salidaPedida: boolean
  pedirSalir: () => void
  entrar: () => void
  salir: () => void
  tocar: () => void
  /** Devuelve si había un toque y lo borra. */
  consumirToque: () => boolean
}

const LIMPIO = { posicion: null, orientacion: null, yaw: 0, pitch: 0, mirada: { clave: null, progreso: 0 }, tocado: false, salidaPedida: false }

/** Modo VR (visor tipo Cardboard): entrar pasa a calidad baja y salir la devuelve. */
export const useVR = create<EstadoVR>((set, get) => ({
  activo: false,
  calidadPrevia: null,
  ...LIMPIO,
  entrar: () => {
    if (get().activo) return
    set({ activo: true, calidadPrevia: useCalidad.getState().calidad, ...LIMPIO })
    useCalidad.setState({ calidad: 'baja' })
  },
  salir: () => {
    const { activo, calidadPrevia } = get()
    if (!activo) return
    if (calidadPrevia) useCalidad.setState({ calidad: calidadPrevia })
    set({ activo: false, calidadPrevia: null, ...LIMPIO })
  },
  tocar: () => set({ tocado: true }),
  pedirSalir: () => set({ salidaPedida: true }),
  consumirToque: () => {
    const hubo = get().tocado
    if (hubo) set({ tocado: false })
    return hubo
  },
}))
