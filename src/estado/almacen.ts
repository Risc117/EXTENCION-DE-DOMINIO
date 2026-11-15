import { create } from 'zustand'
import {
  ACIMUT_INICIAL,
  AJUSTE_GESTOS_DEFECTO,
  DISTANCIA_INICIAL,
  ELEVACION_INICIAL,
  ELEVACION_MAXIMA,
  ELEVACION_MINIMA,
  ZOOM_MAXIMO,
  ZOOM_MINIMO,
} from '../nucleo/constantes'
import { guardarPanelAbierto, leerPanelAbierto } from './preferenciaPanel'

/** apagado: sin gestos · iniciando: pidiendo cámara · activo: leyendo la mano · denegado: sin permiso · error: otro fallo. */
export type EstadoGestos = 'apagado' | 'iniciando' | 'activo' | 'denegado' | 'error'

/** Posición deseada de la cámara. La escena la lee; mouse y mano la cambian con intenciones. */
export interface Camara {
  acimut: number
  elevacion: number
  /** Distancia al tanque, como múltiplo del lado mayor. */
  distancia: number
}

/** Ajuste fino de los gestos de mano (lo cambian los deslizadores). */
export type AjusteGestos = { giro: number; zoom: number; suavizado: number; zonaMuerta: number }

const camaraInicial = (): Camara => ({ acimut: ACIMUT_INICIAL, elevacion: ELEVACION_INICIAL, distancia: DISTANCIA_INICIAL })
const acotar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

interface Estado {
  /** true si alguna unidad muestra datos de ejemplo. */
  hayDatosDemo: boolean
  fijarDatosDemo: (valor: boolean) => void

  /** Unidades que se pueden enfocar (las registra main.tsx; la interfaz arma sus botones con ellas). */
  unidadesEnfocables: { id: string; nombre: string }[]
  fijarUnidadesEnfocables: (lista: { id: string; nombre: string }[]) => void

  camara: Camara
  /** Unidad que mira la cámara; null = vista general de toda la planta. */
  foco: string | null
  /** Intención: llevar la cámara a una unidad (o a la vista general con null). */
  irA: (id: string | null) => void
  pausado: boolean
  /** Intenciones: las emiten el mouse y la mano. */
  girar: (dAcimut: number, dElevacion: number) => void
  hacerZoom: (factor: number) => void
  /** Pone la cámara en una vista (la usa la demo). */
  fijarCamara: (camara: Camara) => void
  fijarPausa: (valor: boolean) => void
  reiniciarCamara: () => void

  /** El usuario pidió gestos (botón). La capa de entrada lo atiende y reporta en `gestos`. */
  gestosPedidos: boolean
  pedirGestos: (valor: boolean) => void
  ajusteGestos: AjusteGestos
  /** El panel de ajuste está desplegado (se recuerda entre visitas). */
  panelAjusteAbierto: boolean
  alternarPanelAjuste: () => void
  cambiarAjusteGestos: (cambio: Partial<AjusteGestos>) => void
  restablecerAjusteGestos: () => void
  gestos: EstadoGestos
  manoDetectada: boolean
  fijarGestos: (valor: EstadoGestos) => void
  fijarManoDetectada: (valor: boolean) => void
}

export const useEstado = create<Estado>((set) => ({
  hayDatosDemo: false,
  fijarDatosDemo: (valor) => set({ hayDatosDemo: valor }),

  unidadesEnfocables: [],
  fijarUnidadesEnfocables: (lista) => set({ unidadesEnfocables: lista }),

  camara: camaraInicial(),
  foco: null,
  irA: (id) => set((s) => ({ foco: id, camara: { ...s.camara, distancia: DISTANCIA_INICIAL } })),
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
  fijarCamara: (camara) => set({ camara: { ...camara } }),
  fijarPausa: (valor) => set({ pausado: valor }),
  reiniciarCamara: () => set({ camara: camaraInicial(), pausado: false }),

  gestosPedidos: false,
  pedirGestos: (valor) => set({ gestosPedidos: valor }),
  ajusteGestos: { ...AJUSTE_GESTOS_DEFECTO },
  panelAjusteAbierto: leerPanelAbierto(),
  alternarPanelAjuste: () =>
    set((s) => {
      guardarPanelAbierto(!s.panelAjusteAbierto)
      return { panelAjusteAbierto: !s.panelAjusteAbierto }
    }),
  cambiarAjusteGestos: (cambio) => set((s) => ({ ajusteGestos: { ...s.ajusteGestos, ...cambio } })),
  restablecerAjusteGestos: () => set({ ajusteGestos: { ...AJUSTE_GESTOS_DEFECTO } }),
  gestos: 'apagado',
  manoDetectada: false,
  fijarGestos: (valor) => set(valor === 'apagado' ? { gestos: valor, manoDetectada: false } : { gestos: valor }),
  fijarManoDetectada: (valor) => set({ manoDetectada: valor }),
}))
