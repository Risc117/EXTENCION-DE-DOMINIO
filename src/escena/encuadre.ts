import { MARGEN_VISTA_GENERAL, OBJETIVO_CAMARA } from '../nucleo/constantes'
import type { Unidad } from '../unidades/tipos'
import { cotaReferencia, posicionEscena } from '../unidades/ubicar'

export interface Encuadre {
  /** Punto al que mira la cámara (metros, escena). */
  objetivo: [number, number, number]
  /** Metros que equivalen a "distancia = 1" de la cámara. */
  escala: number
}

type Lugar = Pick<Unidad, 'id' | 'posicion' | 'cotaFondo' | 'tamano'>

/** A dónde mira la cámara: una unidad (por id) o, con null o un id desconocido, toda la planta. */
export function encuadre(unidades: Lugar[], foco: string | null): Encuadre {
  const ref = cotaReferencia(unidades)
  const alto = OBJETIVO_CAMARA[1]
  const una = foco === null ? undefined : unidades.find((u) => u.id === foco)
  if (una) {
    const [x, y, z] = posicionEscena(una, ref)
    return { objetivo: [x, y + alto, z], escala: una.tamano }
  }
  const xs = unidades.flatMap((u) => [u.posicion.x - u.tamano / 2, u.posicion.x + u.tamano / 2])
  const ys = unidades.flatMap((u) => [u.posicion.y - u.tamano / 2, u.posicion.y + u.tamano / 2])
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  return {
    objetivo: [(x0 + x1) / 2, alto, -(y0 + y1) / 2],
    escala: Math.max(x1 - x0, y1 - y0) * MARGEN_VISTA_GENERAL,
  }
}
