import { TRANSICION_EXPLANADA, alturaEn, aplanar, cuadricula, terreno, type Cuadricula } from '../../nucleo/terreno'
import { planta } from '../planta'

const guardadas = new Map<number, Cuadricula>()

/** Terreno levantado, ya aplanado alrededor de cada unidad hidráulica (`salto` = cada cuántos nodos de la malla; 1 = todos). No incluye la nivelación de edificios y vía. */
export function terrenoUnidades(salto = 1): Cuadricula {
  let g = guardadas.get(salto)
  if (!g) {
    g = aplanar(
      cuadricula(terreno, salto),
      planta.unidades.map((u) => ({ x: u.x.valor, y: u.y.valor, cota: u.cotaSuperficie.valor, radio: u.radioExplanada.valor })),
      TRANSICION_EXPLANADA,
    )
    guardadas.set(salto, g)
  }
  return g
}

/** Cota (m s.n.m.) del terreno aplanado alrededor de las unidades en (x, y), como lo usan las tuberías. */
export function alturaTerreno(x: number, y: number): number {
  return alturaEn(terrenoUnidades(1), x, y) ?? Number.NEGATIVE_INFINITY
}
