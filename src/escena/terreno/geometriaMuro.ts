import { alturaEn, type Cuadricula } from '../../nucleo/terreno'

type Punto = [number, number]

/** Puntos a lo largo del trazo, a no más de `tramo` metros uno del otro (incluye los vértices del trazo). */
export function muestrearTrazo(trazo: Punto[], tramo: number): Punto[] {
  const salida: Punto[] = []
  trazo.forEach((p, i) => {
    if (i > 0) {
      const a = trazo[i - 1]
      const n = Math.max(1, Math.ceil(Math.hypot(p[0] - a[0], p[1] - a[1]) / tramo))
      for (let k = 1; k < n; k++) salida.push([a[0] + ((p[0] - a[0]) * k) / n, a[1] + ((p[1] - a[1]) * k) / n])
    }
    salida.push(p)
  })
  return salida
}

/**
 * Muro como una cinta con cara exterior, cara interior y coronación. La cara interior queda `espesor` metros hacia
 * el lado de la planta (a la derecha del sentido del trazo). Sigue el terreno y baja `enterrado` metros bajo él.
 */
export function geometriaMuro(trazo: Punto[], g: Cuadricula, referencia: number, espesor: number, altura: number, enterrado: number, tramo: number) {
  const puntos = muestrearTrazo(trazo, tramo)
  const posiciones: number[] = []
  const indices: number[] = []
  puntos.forEach((p, i) => {
    const [a, b] = [puntos[Math.max(0, i - 1)], puntos[Math.min(puntos.length - 1, i + 1)]]
    const largo = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
    const interior: Punto = [p[0] + ((b[1] - a[1]) / largo) * espesor, p[1] - ((b[0] - a[0]) / largo) * espesor]
    const suelo = (alturaEn(g, p[0], p[1]) ?? referencia) - referencia
    // Cuatro vértices por punto: exterior abajo, exterior arriba, interior arriba, interior abajo.
    posiciones.push(p[0], suelo - enterrado, -p[1], p[0], suelo + altura, -p[1], interior[0], suelo + altura, -interior[1], interior[0], suelo - enterrado, -interior[1])
    if (i > 0) {
      for (let l = 0; l < 4; l++) {
        const [a0, b0, a1, b1] = [(i - 1) * 4 + l, i * 4 + l, (i - 1) * 4 + ((l + 1) % 4), i * 4 + ((l + 1) % 4)]
        indices.push(a0, b0, b1, a0, b1, a1)
      }
    }
  })
  return { posiciones: new Float32Array(posiciones), indices: new Uint32Array(indices) }
}
