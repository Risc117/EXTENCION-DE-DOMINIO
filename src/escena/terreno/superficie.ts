import { TOLERANCIA_TERRENO_MODIFICADO, alturaEn, cuadricula, terreno, type Cuadricula, type Explanada } from '../../nucleo/terreno'
import { terrenoNivelado } from '../../unidades/entorno/terrenoNivelado'
import { planta } from '../../unidades/planta'

/** Explanadas de la planta: una por unidad, con la cota y el radio de planta.json. */
export const explanadasPlanta: Explanada[] = planta.unidades.map((u) => ({ x: u.x.valor, y: u.y.valor, cota: u.cotaSuperficie.valor, radio: u.radioExplanada.valor }))

const natural = cuadricula(terreno, 1)

/** Cuadrícula del terreno de la escena: aplanada alrededor de cada unidad y nivelada bajo los edificios y la vía interna (`salto` = cada cuántos nodos de la malla; 1 = todos). */
export function superficieTerreno(salto = 1): Cuadricula {
  return terrenoNivelado(salto).cuadricula
}

/** El terreno en (x, y) cambió más que la tolerancia por una explanada o una nivelación: las curvas de nivel naturales ya no valen ahí. */
export function terrenoModificado([x, y]: [number, number]): boolean {
  const [antes, nuevo] = [alturaEn(natural, x, y), alturaEn(superficieTerreno(1), x, y)]
  return antes !== null && nuevo !== null && Math.abs(nuevo - antes) > TOLERANCIA_TERRENO_MODIFICADO
}
