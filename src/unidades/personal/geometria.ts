export interface Punto {
  x: number
  y: number
}

/** Une varios tramos en una sola polilínea sin repetir el punto donde un tramo empieza donde terminó el anterior. */
export function entrePuntos(tramos: Punto[][]): Punto[] {
  const out: Punto[] = []
  for (const t of tramos) {
    for (const p of t) {
      const u = out[out.length - 1]
      if (!u || Math.hypot(p.x - u.x, p.y - u.y) > 1e-9) out.push(p)
    }
  }
  return out
}

/** Mueve una polilínea de lado `lado` metros (positivo = a la izquierda de su sentido de avance). */
export function desplazar(ruta: Punto[], lado: number): Punto[] {
  const normal = (a: Punto, b: Punto): Punto => {
    const l = Math.hypot(b.x - a.x, b.y - a.y) || 1
    return { x: -(b.y - a.y) / l, y: (b.x - a.x) / l }
  }
  return ruta.map((p, i) => {
    const [antes, despues] = [normal(ruta[Math.max(0, i - 1)], p), normal(p, ruta[Math.min(ruta.length - 1, i + 1)])]
    const [nx, ny] = [antes.x + despues.x, antes.y + despues.y]
    const l = Math.hypot(nx, ny) || 1
    return { x: p.x + (lado * nx) / l, y: p.y + (lado * ny) / l }
  })
}

/** Distancia a lo largo de la polilínea hasta el punto de ella más cercano a `p`, y a qué distancia queda `p` de la ruta. */
export function proyectar(ruta: Punto[], p: Punto): { d: number; distancia: number } {
  let mejor = { d: 0, distancia: Number.POSITIVE_INFINITY }
  let acumulado = 0
  for (let i = 1; i < ruta.length; i++) {
    const [dx, dy] = [ruta[i].x - ruta[i - 1].x, ruta[i].y - ruta[i - 1].y]
    const largo = Math.hypot(dx, dy)
    const f = largo === 0 ? 0 : Math.min(1, Math.max(0, ((p.x - ruta[i - 1].x) * dx + (p.y - ruta[i - 1].y) * dy) / (largo * largo)))
    const distancia = Math.hypot(p.x - (ruta[i - 1].x + dx * f), p.y - (ruta[i - 1].y + dy * f))
    if (distancia < mejor.distancia) mejor = { d: acumulado + f * largo, distancia }
    acumulado += largo
  }
  return mejor
}

/** Distancia a lo largo de la polilínea hasta el punto más cercano a `p`. */
export const distanciaAlo = (ruta: Punto[], p: Punto): number => proyectar(ruta, p).d

/** true si el punto está dentro del polígono (se cuentan los cruces de un rayo hacia el este). */
export function puntoEnPoligono(p: Punto, poligono: Punto[]): boolean {
  let dentro = false
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const [a, b] = [poligono[i], poligono[j]]
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) dentro = !dentro
  }
  return dentro
}

/** Centro del rectángulo que envuelve un polígono. */
export function centroDeCaja(poligono: Punto[]): Punto {
  const [xs, ys] = [poligono.map((p) => p.x), poligono.map((p) => p.y)]
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 }
}
