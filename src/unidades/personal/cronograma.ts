export interface Parada {
  /** Distancia (m) desde el origen de la ruta. */
  d: number
  /** Cuánto se queda (s). */
  pausa: number
}

export interface OpcionesCiclo {
  /** Tiempo (s) que espera en el origen (oculto) antes de salir. */
  espera?: number
  /** Tiempo (s) que se queda al llegar al final de la ruta. */
  pausaFinal?: number
  /** Adelanto (0 a 1) dentro del ciclo, para que varios no vayan juntos. */
  fase?: number
}

export interface EstadoRecorrido {
  d: number
  /** 1 = yendo hacia el final de la ruta; −1 = volviendo. */
  sentido: 1 | -1
  parado: boolean
  /** true mientras espera en el origen (fuera de la planta). */
  oculto: boolean
}

/** Puntos por los que pasa en un ciclo, con su pausa: origen, paradas de ida, final y paradas de vuelta. */
function puntosDelCiclo(largo: number, paradas: Parada[], o: OpcionesCiclo): Parada[] {
  const ida = [...paradas].sort((a, b) => a.d - b.d)
  return [{ d: 0, pausa: o.espera ?? 0 }, ...ida, { d: largo, pausa: o.pausaFinal ?? 0 }, ...[...ida].reverse()]
}

/** Segundos que dura un ciclo completo: ida y vuelta a la velocidad dada, más todas las pausas. */
export function duracionCiclo(largo: number, paradas: Parada[], velocidad: number, o: OpcionesCiclo = {}): number {
  const p = puntosDelCiclo(largo, paradas, o)
  return p.reduce((s, x, i) => s + x.pausa + Math.abs(p[(i + 1) % p.length].d - x.d) / velocidad, 0)
}

/** Dónde está (distancia, sentido, si está parado u oculto) en el instante `t` de un recorrido de ida y vuelta con paradas, que se repite. */
export function estadoEnTiempo(largo: number, paradas: Parada[], velocidad: number, t: number, o: OpcionesCiclo = {}): EstadoRecorrido {
  const p = puntosDelCiclo(largo, paradas, o)
  const ciclo = duracionCiclo(largo, paradas, velocidad, o)
  const alFinal = p.findIndex((x) => x.d === largo)
  let r = (((t + (o.fase ?? 0) * ciclo) % ciclo) + ciclo) % ciclo
  for (let i = 0; i < p.length; i++) {
    const sentido = i <= alFinal ? 1 : -1
    if (r < p[i].pausa) return { d: p[i].d, sentido, parado: true, oculto: i === 0 && (o.espera ?? 0) > 0 }
    r -= p[i].pausa
    const siguiente = p[(i + 1) % p.length]
    const viaje = Math.abs(siguiente.d - p[i].d) / velocidad
    if (r < viaje) {
      const hacia = siguiente.d >= p[i].d ? 1 : -1
      return { d: p[i].d + hacia * r * velocidad, sentido: hacia, parado: false, oculto: false }
    }
    r -= viaje
  }
  return { d: 0, sentido: 1, parado: true, oculto: false }
}
