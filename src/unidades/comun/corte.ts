import { ESPIRAL } from '../../nucleo/constantes'
import { OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { planta } from '../planta'
import { girar, planoAMundo, type PlanoLocal, type UbicacionEscena } from '../ubicacion'

export interface PlanoCorte {
  normal: [number, number, number]
  constante: number
}

/**
 * Plano vertical del corte. Se recorta lo que queda del lado +z (distancia negativa).
 * `posicion` va de -1 a 1 como fracción del radio.
 */
export function planoCorte(activo: boolean, posicion: number, radio: number): PlanoCorte | null {
  if (!activo) return null
  return { normal: [0, 0, -1], constante: posicion * radio }
}

/**
 * Giro (rad) con el que TODAS las unidades arman su plano de corte: el del RAFA (datos/planta.json). Así todas quitan la misma mitad del mundo
 * (la este) y dejan la misma cara cortada, sin depender del giro de cada una (T16.4.3).
 */
export const GIRO_CORTE_COMUN = (planta.unidades.find((u) => u.id === 'rafa')!.giro.valor * Math.PI) / 180

/** Plano del corte en el mundo (el que pide three.js): el mismo para todas las unidades, pasando por el centro de la unidad que lo pide. */
export function planoCorteMundo(activo: boolean, posicion: number, radio: number, ubicacion: UbicacionEscena): PlanoLocal | null {
  const local = planoCorte(activo, posicion, radio)
  if (!local) return null
  return planoAMundo(local, { ...ubicacion, giro: GIRO_CORTE_COMUN })
}

/** El mismo plano, expresado en el eje propio de la unidad (para decidir qué etiquetas quedan cortadas). */
export function planoCorteLocal(activo: boolean, posicion: number, radio: number, ubicacion: UbicacionEscena): PlanoLocal | null {
  const mundo = planoCorteMundo(activo, posicion, radio, ubicacion)
  if (!mundo) return null
  const [px, py, pz] = ubicacion.posicion
  return { normal: girar(mundo.normal, -ubicacion.giro), constante: mundo.constante + mundo.normal[0] * px + mundo.normal[1] * py + mundo.normal[2] * pz }
}

/** Opacidad de los muros y techos con el corte: opacos sin "Ver corte" (undefined) y translúcidos con él. Es el criterio de todas las unidades. */
export const opacidadCorte = (activo: boolean): number | undefined => (activo ? OPACIDAD_CANAL : undefined)

/** Puntos de una espiral plana (y = 0) que va del centro hasta `radio`. */
export function puntosEspiral(radio: number, vueltas: number = ESPIRAL.vueltas, n: number = ESPIRAL.puntos): [number, number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const u = i / (n - 1)
    const angulo = vueltas * 2 * Math.PI * u
    return [radio * u * Math.cos(angulo), 0, radio * u * Math.sin(angulo)]
  })
}
