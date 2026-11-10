/** Generador de números al azar repetible (mulberry32): misma semilla, misma secuencia. */
export function crearAzar(semilla: number): () => number {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Número al azar entre min (incluido) y max (excluido). */
export function entre(azar: () => number, min: number, max: number): number {
  return min + azar() * (max - min)
}
