import { create } from 'zustand'
import {
  ACIMUT_INICIAL,
  DISTANCIA_INICIAL,
  ELEVACION_INICIAL,
  ELEVACION_MAXIMA,
  ELEVACION_MINIMA,
  ZOOM_MAXIMO,
  ZOOM_MINIMO,
} from '../nucleo/constantes'

/** apagado: sin gestos · iniciando: pidiendo cámara · activo: leyendo la mano · denegado: sin permiso · error: otro fallo. */
export type EstadoGestos = 'apagado' | 'iniciando' | 'activo' | 'denegado' | 'error'

/** Posición deseada de la cámara. La escena la lee; mouse y mano la cambian con intenciones. */
export interface Camara {
  acimut: number
  elevacion: number
  /** Distancia al tanque, como múltiplo del lado mayor. */
  distancia: number
}

const camaraInicial = (): Camara => ({ acimut: ACIMUT_INICIAL, elevacion: ELEVACION_INICIAL, distancia: DISTANCIA_INICIAL })
const acotar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

interface Estado {
  /** true si alguna unidad muestra datos de ejemplo. */
  hayDatosDemo: boolean
  fijarDatosDemo: (valor: boolean) => void

  camara: Camara
  pausado: boolean
  /** Intenciones: las emiten el mouse y la mano. */
  girar: (dAcimut: number, dElevacion: number) => void
  hacerZoom: (factor: number) => void
  fijarPausa: (valor: boolean) => void
  reiniciarCamara: () => void

  /** El usuario pidió gestos (botón). La capa de entrada lo atiende y reporta en `gestos`. */
  gestosPedidos: boolean
  pedirGestos: (valor: boolean) => void
  gestos: EstadoGestos
  manoDetectada: boolean
  fijarGestos: (valor: EstadoGestos) => void
  fijarManoDetectada: (valor: boolean) => void
}

export const useEstado = create<Estado>((set) => ({
  hayDatosDemo: false,
  fijarDatosDemo: (valor) => set({ hayDatosDemo: valor }),

  camara: camaraInicial(),
  pausado: false,
  girar: (dAcimut, dElevacion) =>
    set((s) => ({
      camara: {
        ...s.camara,
        acimut: s.camara.acimut + dAcimut,
        elevacion: acotar(s.camara.elevacion + dElevacion, ELEVACION_MINIMA, ELEVACION_MAXIMA),
      },
    })),
  hacerZoom: (factor) =>
    set((s) => ({ camara: { ...s.camara, distancia: acotar(s.camara.distancia * factor, ZOOM_MINIMO, ZOOM_MAXIMO) } })),
  fijarPausa: (valor) => set({ pausado: valor }),
  reiniciarCamara: () => set({ camara: camaraInicial(), pausado: false }),

  gestosPedidos: false,
  pedirGestos: (valor) => set({ gestosPedidos: valor }),
  gestos: 'apagado',
  manoDetectada: false,
  fijarGestos: (valor) => set(valor === 'apagado' ? { gestos: valor, manoDetectada: false } : { gestos: valor }),
  fijarManoDetectada: (valor) => set({ manoDetectada: valor }),
}))
