import { ESCALA_MAXIMA_LLAMA } from '../../nucleo/constantesBiogas'
import type { Vec3 } from '../comun/tiposAnotaciones'

/** Recorrido de la línea de biogás en la escena: sus puntos, la distancia acumulada en cada uno y el largo total. */
export interface RutaBiogas {
  puntos: Vec3[]
  acumulado: number[]
  largo: number
}

/** Ruta de la línea de biogás sobre el terreno (`altura` m más arriba). Escena: x este, y arriba, z sur. */
export function rutaBiogas(trazado: { x: number; y: number }[], terrenoEn: (x: number, y: number) => number, referencia: number, altura: number): RutaBiogas {
  const puntos = trazado.map((p): Vec3 => [p.x, terrenoEn(p.x, p.y) - referencia + altura, -p.y])
  const acumulado = [0]
  for (let i = 1; i < puntos.length; i++) acumulado.push(acumulado[i - 1] + Math.hypot(puntos[i][0] - puntos[i - 1][0], puntos[i][1] - puntos[i - 1][1], puntos[i][2] - puntos[i - 1][2]))
  return { puntos, acumulado, largo: acumulado[acumulado.length - 1] }
}

/** Punto de la ruta a una distancia del inicio; pasado el final da la vuelta. */
export function puntoEnRuta(r: RutaBiogas, distancia: number): Vec3 {
  const d = ((distancia % r.largo) + r.largo) % r.largo
  let i = 1
  while (i < r.acumulado.length - 1 && r.acumulado[i] < d) i++
  const [a, b] = [r.puntos[i - 1], r.puntos[i]]
  const tramo = r.acumulado[i] - r.acumulado[i - 1]
  const f = tramo === 0 ? 0 : (d - r.acumulado[i - 1]) / tramo
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
}

/** `n` perlas repartidas por la ruta, desplazadas `avance` metros en el sentido del flujo (del RAFA a la antorcha). */
export function perlasBiogas(r: RutaBiogas, avance: number, n: number): Vec3[] {
  return Array.from({ length: n }, (_, i) => puntoEnRuta(r, avance + (i * r.largo) / n))
}

/** Tamaño de la llama respecto del que tiene al caudal de diseño: 0 sin biogás y hasta el doble con mucho. */
export const escalaLlama = (biogasM3h: number, disenoM3h: number): number => (biogasM3h <= 0 || disenoM3h <= 0 ? 0 : Math.min(ESCALA_MAXIMA_LLAMA, biogasM3h / disenoM3h))
