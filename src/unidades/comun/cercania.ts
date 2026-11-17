import { DISTANCIA_ANOTACIONES, HISTERESIS_ANOTACIONES } from '../../nucleo/constantesVista'
import type { Vec3 } from './tiposAnotaciones'

/** true si la cámara está lo bastante cerca de una unidad de ese tamaño; `yaCerca` le da un margen para no parpadear en el borde. */
export function estaCerca(distancia: number, tamano: number, yaCerca: boolean): boolean {
  return distancia <= tamano * DISTANCIA_ANOTACIONES * (yaCerca ? HISTERESIS_ANOTACIONES : 1)
}

/** Con una estructura elegida en "Ir a", solo ella muestra sus cotas y etiquetas (las vecinas las guardan para no encimarse); sin ninguna elegida, o sin id, decide la distancia. */
export const esLaEnfocada = (foco: string | null, id: string | undefined): boolean => foco === null || id === undefined || foco === id

export interface BotonesAnotaciones {
  cotas: boolean
  etiquetas: boolean
  /** true = también de lejos. */
  siempre: boolean
}

/** Qué se dibuja: lo que el botón deja y, salvo "de lejos", solo si se está cerca. */
export function anotacionesVisibles(botones: BotonesAnotaciones, cerca: boolean): { cotas: boolean; etiquetas: boolean } {
  const ver = botones.siempre || cerca
  return { cotas: botones.cotas && ver, etiquetas: botones.etiquetas && ver }
}

/** Las etiquetas (con su `punta`) que están a menos de `distancia` m de la cámara. */
export function etiquetasCercanas<T extends { punta: Vec3 }>(camara: Vec3, etiquetas: T[], distancia: number): T[] {
  return etiquetas.filter((e) => Math.hypot(e.punta[0] - camara[0], e.punta[1] - camara[1], e.punta[2] - camara[2]) <= distancia)
}
