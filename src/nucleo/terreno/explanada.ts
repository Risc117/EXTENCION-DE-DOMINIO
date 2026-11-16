import type { Cuadricula } from './altura'
import { DOMINIO_PISO_PLANO } from './constantes'

/** Zona plana alrededor de una unidad: centro (m locales), cota de superficie (m s.n.m.) y radio plano (m). */
export interface Explanada {
  x: number
  y: number
  cota: number
  radio: number
}

/** Peso 1 dentro del radio y 0 pasada la transición, con bajada suave (smoothstep) entre medio. */
function peso(distancia: number, radio: number, transicion: number): number {
  if (distancia <= radio) return 1
  if (distancia >= radio + transicion) return 0
  const s = (distancia - radio) / transicion
  return 1 - s * s * (3 - 2 * s)
}

/**
 * Copia de la cuadrícula con el terreno llevado a la cota de cada explanada y una transición suave.
 * Donde se encimen varias, la cota es el promedio ponderado de ellas (pesa mucho más la que está más cerca de su piso plano); no depende del orden.
 */
export function aplanar(g: Cuadricula, explanadas: Explanada[], transicion: number): Cuadricula {
  if (explanadas.length === 0) return g
  const cotas = g.cotas.slice()
  for (let f = 0; f < g.filas; f++) {
    for (let c = 0; c < g.columnas; c++) {
      const [x, y] = [g.x0 + c * g.paso, g.y0 + f * g.paso]
      let suma = 0
      let total = 0
      let mayor = 0
      for (const e of explanadas) {
        const w = peso(Math.hypot(x - e.x, y - e.y), e.radio, transicion)
        const p = w ** DOMINIO_PISO_PLANO
        suma += p * e.cota
        total += p
        mayor = Math.max(mayor, w)
      }
      if (total === 0) continue
      const i = f * g.columnas + c
      cotas[i] = cotas[i] * (1 - mayor) + (suma / total) * mayor
    }
  }
  return { ...g, cotas }
}
