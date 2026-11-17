import { create } from 'zustand'
import { siguienteFase, type EventoAR, type FaseAR } from '../nucleo/ar/fase'
import { useCalidad } from './calidad'
import type { Calidad } from './preferenciaCalidad'

interface EstadoAR {
  /** El navegador admite AR (WebXR); si no, el botón "AR" no aparece. */
  soportado: boolean
  fijarSoportado: (s: boolean) => void
  activo: boolean
  /** Sesión de WebXR en curso (la crea la entrada y la usa la escena). */
  sesion: XRSession | null
  fase: FaseAR
  /** Punto del mundo de AR donde se colocó la maqueta (m); null hasta colocarla. */
  colocacion: [number, number, number] | null
  /** Calidad que había al entrar, para devolverla al salir (sin tocar la preferencia guardada). */
  calidadPrevia: Calidad | null
  entrar: (sesion: XRSession) => void
  salir: () => void
  evento: (e: EventoAR) => void
  /** Pone la maqueta en ese punto (solo si hay una superficie lista) y pasa a "colocada". */
  colocar: (punto: [number, number, number]) => void
}

const LIMPIO = { sesion: null, fase: 'buscando' as FaseAR, colocacion: null }

/** Modo AR: entrar pasa a calidad baja y salir la devuelve; sigue las fases buscando → lista → colocada. */
export const useAR = create<EstadoAR>((set, get) => ({
  soportado: false,
  fijarSoportado: (soportado) => set({ soportado }),
  activo: false,
  calidadPrevia: null,
  ...LIMPIO,
  entrar: (sesion) => {
    if (get().activo) return
    set({ ...LIMPIO, activo: true, sesion, calidadPrevia: useCalidad.getState().calidad })
    useCalidad.setState({ calidad: 'baja' })
  },
  salir: () => {
    const { activo, calidadPrevia } = get()
    if (!activo) return
    if (calidadPrevia) useCalidad.setState({ calidad: calidadPrevia })
    set({ activo: false, calidadPrevia: null, ...LIMPIO })
  },
  evento: (e) => {
    const fase = siguienteFase(get().fase, e)
    if (fase === get().fase) return
    set(e === 'recolocar' ? { fase, colocacion: null } : { fase })
  },
  colocar: (punto) => {
    if (get().fase !== 'lista') return
    set({ fase: siguienteFase('lista', 'tocar'), colocacion: punto })
  },
}))
