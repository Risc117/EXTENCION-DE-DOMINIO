import { TRANSICION_EXPLANADA, alturaEn, aplanar, cuadricula, terreno, type Cuadricula } from '../../nucleo/terreno'
import { planta } from '../planta'

let aplanado: Cuadricula | null = null

/** Cota (m s.n.m.) del terreno de la escena en (x, y): el levantado, ya aplanado alrededor de cada unidad como lo dibuja el visor. */
export function alturaTerreno(x: number, y: number): number {
  aplanado ??= aplanar(
    cuadricula(terreno, 1),
    planta.unidades.map((u) => ({ x: u.x.valor, y: u.y.valor, cota: u.cotaSuperficie.valor, radio: u.radioExplanada.valor })),
    TRANSICION_EXPLANADA,
  )
  return alturaEn(aplanado, x, y) ?? Number.NEGATIVE_INFINITY
}
