import { ESPIRAL } from '../../nucleo/constantes'
import { OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { planoAMundo, type UbicacionEscena } from '../ubicacion'

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
 * Plano del corte en el mundo (el que pide three.js). Por defecto es el eje local de la unidad (gira con ella);
 * `giroCorte` (rad) lo arma como si la unidad tuviera ese giro, para que quite la misma mitad del mundo que otra unidad.
 */
export function planoCorteMundo(activo: boolean, posicion: number, radio: number, ubicacion: UbicacionEscena, giroCorte?: number) {
  const local = planoCorte(activo, posicion, radio)
  if (!local) return null
  return planoAMundo(local, giroCorte === undefined ? ubicacion : { ...ubicacion, giro: giroCorte })
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
