import { DISTANCIA_INICIAL } from '../nucleo/constantesCamara'
import { ESCALONES_ETIQUETAS, FRACCION_ESCALON_ETIQUETAS, FLECHA_PLANTA_MAXIMA, FLECHA_PLANTA_MINIMA, FRACCION_FLECHA_PLANTA, MARGEN_NIVEL_ETIQUETAS, UMBRAL_ETIQUETAS_CERCA, UMBRAL_ETIQUETAS_LEJOS } from '../nucleo/constantesEtiquetas'
import type { EtiquetaCalculada, Vec3 } from '../unidades/comun/tiposAnotaciones'

/** Cuánto detalle de etiquetas se ve: lejos = unidades; medio = unidades y edificios; cerca = ninguna de planta (cada unidad dibuja las suyas). */
export type NivelEtiquetas = 'lejos' | 'medio' | 'cerca'

export interface ItemEtiqueta {
  id: string
  texto: string
  tipo: 'unidad' | 'edificio'
  /** Punto de la escena al que apunta la flecha. */
  punta: Vec3
}

/**
 * Nivel según la distancia de la cámara (en unidades de la vista general) y la unidad enfocada. Con `actual` se deja un margen
 * en cada umbral para que no cambie de nivel de un lado a otro estando justo en el borde.
 */
export function nivelEtiquetas(distancia: number, foco: string | null, actual: NivelEtiquetas): NivelEtiquetas {
  if (foco !== null) return 'cerca'
  const lejos = DISTANCIA_INICIAL * UMBRAL_ETIQUETAS_LEJOS
  const cerca = DISTANCIA_INICIAL * UMBRAL_ETIQUETAS_CERCA
  if (distancia > lejos * (actual === 'lejos' ? 1 / MARGEN_NIVEL_ETIQUETAS : MARGEN_NIVEL_ETIQUETAS)) return 'lejos'
  return distancia < cerca * (actual === 'cerca' ? MARGEN_NIVEL_ETIQUETAS : 1 / MARGEN_NIVEL_ETIQUETAS) ? 'cerca' : 'medio'
}

/** Largo (m) de la flecha: crece con la distancia de la cámara (en m) para que se lea de lejos, entre un mínimo y un máximo. */
export const largoFlecha = (distanciaMundo: number): number => Math.min(FLECHA_PLANTA_MAXIMA, Math.max(FLECHA_PLANTA_MINIMA, distanciaMundo * FRACCION_FLECHA_PLANTA))

/** Largo (m) de la flecha de la etiqueta número `indice` (en el orden en que se dibujan): sube por escalones y vuelve a empezar, para que las vecinas no queden a la misma altura. */
export const largoEscalonado = (largo: number, indice: number): number => largo * (1 + (indice % ESCALONES_ETIQUETAS) * FRACCION_ESCALON_ETIQUETAS)

/** Las etiquetas que salen en un nivel, con su texto sobre la punta a la altura que da el largo de la flecha (escalonado entre vecinas). */
export function etiquetasDelNivel(items: ItemEtiqueta[], nivel: NivelEtiquetas, distanciaMundo: number): EtiquetaCalculada[] {
  if (nivel === 'cerca') return []
  const largo = largoFlecha(distanciaMundo)
  return items
    .filter((i) => i.tipo === 'unidad' || nivel === 'medio')
    .map((i, n) => ({ id: i.id, texto: i.texto, origen: [i.punta[0], i.punta[1] + largoEscalonado(largo, n), i.punta[2]] as Vec3, punta: i.punta, interior: false, prioridad: false }))
}
