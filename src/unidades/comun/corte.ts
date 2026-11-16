import { ESPIRAL } from '../../nucleo/constantes'

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

/** Puntos de una espiral plana (y = 0) que va del centro hasta `radio`. */
export function puntosEspiral(radio: number, vueltas: number = ESPIRAL.vueltas, n: number = ESPIRAL.puntos): [number, number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const u = i / (n - 1)
    const angulo = vueltas * 2 * Math.PI * u
    return [radio * u * Math.cos(angulo), 0, radio * u * Math.sin(angulo)]
  })
}
