type Punto = [number, number]

/** Distancia de p al segmento a-b. */
function distancia(p: Punto, a: Punto, b: Punto): number {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const l2 = dx * dx + dy * dy
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2))
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
}

/** Douglas-Peucker: quita vértices que se desvían menos de `tolerancia` metros de la recta. */
export function simplificar(puntos: Punto[], tolerancia: number): Punto[] {
  if (puntos.length < 3) return puntos
  const conservar = new Array<boolean>(puntos.length).fill(false)
  conservar[0] = conservar[puntos.length - 1] = true
  const pila: [number, number][] = [[0, puntos.length - 1]]
  while (pila.length > 0) {
    const [i, j] = pila.pop()!
    let max = 0
    let k = -1
    for (let m = i + 1; m < j; m++) {
      const d = distancia(puntos[m], puntos[i], puntos[j])
      if (d > max) [max, k] = [d, m]
    }
    if (k >= 0 && max > tolerancia) {
      conservar[k] = true
      pila.push([i, k], [k, j])
    }
  }
  return puntos.filter((_, i) => conservar[i])
}
