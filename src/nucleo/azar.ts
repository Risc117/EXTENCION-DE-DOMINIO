import { GENERADOR_ESTRELLAS as G } from './constantesAmbiente'

/** Generador pseudoaleatorio con semilla (siempre la misma secuencia): devuelve números en [0, 1). */
export function azar(semilla: number): () => number {
  let s = semilla
  return () => {
    s = (s * G.multiplicador + G.incremento) % G.modulo
    return s / G.modulo
  }
}
