export interface Punto {
  x: number
  y: number
}

/** Posición en el plano (x este, y norte, m) y rumbo (rad, ángulo del plano) de un animal. */
export interface Pose extends Punto {
  rumbo: number
  /** true = no se ve (espera fuera de la planta). */
  oculto?: boolean
  /** true = está detenido (se reproduce la animación de quieto). */
  parado?: boolean
}

/** Largos acumulados de una polilínea (el primero es 0). */
export function acumulados(ruta: Punto[]): number[] {
  const a = [0]
  for (let i = 1; i < ruta.length; i++) a.push(a[i - 1] + Math.hypot(ruta[i].x - ruta[i - 1].x, ruta[i].y - ruta[i - 1].y))
  return a
}

/** Punto a la distancia `d` a lo largo de la polilínea y rumbo del tramo (hacia delante). */
export function sobreRuta(ruta: Punto[], acum: number[], d: number): Pose {
  let i = 1
  while (i < ruta.length - 1 && acum[i] < d) i++
  const [a, b] = [ruta[i - 1], ruta[i]]
  const f = (d - acum[i - 1]) / (acum[i] - acum[i - 1] || 1)
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, rumbo: Math.atan2(b.y - a.y, b.x - a.x) }
}
