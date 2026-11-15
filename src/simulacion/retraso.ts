/**
 * Retraso puro: el caudal que sale es el que entró hace `retencion` segundos.
 * Antes de que pase ese tiempo sale el primer caudal recibido (la planta arranca en régimen).
 */
export interface Retraso {
  /** Registra el caudal (L/s) que entra durante los próximos `dt` s y devuelve el que sale ahora. */
  paso: (entrada: number, dt: number) => number
}

export function crearRetraso(retencion: number): Retraso {
  const tiempos: number[] = []
  const caudales: number[] = []
  let ahora = 0
  return {
    paso(entrada, dt) {
      tiempos.push(ahora)
      caudales.push(entrada)
      const objetivo = ahora - retencion
      ahora += dt
      if (objetivo < 0) return caudales[0]
      // último registro que empezó en `objetivo` o antes; los anteriores ya no se usan
      let i = tiempos.length - 1
      while (i > 0 && tiempos[i] > objetivo) i--
      if (i > 0) {
        tiempos.splice(0, i)
        caudales.splice(0, i)
      }
      return caudales[0]
    },
  }
}
