import { create } from 'zustand'
import type { Camara } from './almacen'
import type { ModoSalida } from './simulacion'

/** Cambios que hace un paso de la demo en la simulación (todo es opcional). */
export interface AccionDemo {
  dia?: number
  velocidad?: number
  modoSalida?: ModoSalida
  /** null = volver al promedio del día. */
  salidaAjuste?: number | null
}

export interface PasoDemo {
  titulo: string
  texto: string
  duracionSegundos: number
  vista: Camara
  /** Unidad que se enfoca: sin valor = el homogeneizador; null = vista general de la planta. */
  foco?: string | null
  accion: AccionDemo
}

/** Lo que había antes de empezar la demo, para dejarlo igual al salir. */
export interface Respaldo {
  dia: number
  velocidad: number
  modoSalida: ModoSalida
  salidaAjuste: number | null
  corriendo: boolean
  hora: number
  volumen: number
  camara: Camara
  foco: string | null
}

/** Órdenes que da la interfaz; las atiende la demo (igual que los gestos pedidos). */
export type OrdenDemo = 'iniciar' | 'siguiente' | 'anterior' | 'salir'

export interface EstadoDemo {
  /** Pantalla inicial visible. */
  bienvenida: boolean
  activa: boolean
  paso: number
  total: number
  /** Segundos transcurridos en el paso y lo que dura. */
  transcurrido: number
  duracion: number
  titulo: string
  texto: string
  respaldo: Respaldo | null
  orden: OrdenDemo | null
  ordenar: (o: OrdenDemo) => void
  cerrarBienvenida: () => void
}

export const INICIO_DEMO = {
  bienvenida: true,
  activa: false,
  paso: 0,
  total: 0,
  transcurrido: 0,
  duracion: 0,
  titulo: '',
  texto: '',
  respaldo: null,
  orden: null,
}

export const useDemo = create<EstadoDemo>((set) => ({
  ...INICIO_DEMO,
  ordenar: (orden) => set({ orden }),
  cerrarBienvenida: () => set({ bienvenida: false }),
}))
