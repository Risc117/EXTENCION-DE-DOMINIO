import { TOLERANCIA_TERRENO_MODIFICADO, TRANSICION_EXPLANADA, alturaEn, aplanar, cuadricula, terreno, type Cuadricula, type Explanada } from '../../nucleo/terreno'
import { planta } from '../../unidades/planta'

/** Explanadas de la planta: una por unidad, con la cota y el radio de planta.json. */
export const explanadasPlanta: Explanada[] = planta.unidades.map((u) => ({ x: u.x.valor, y: u.y.valor, cota: u.cotaSuperficie.valor, radio: u.radioExplanada.valor }))

const guardadas = new Map<number, Cuadricula>()
const natural = cuadricula(terreno, 1)

/** Cuadrícula del terreno ya aplanada alrededor de cada unidad (`salto` = cada cuántos nodos de la malla; 1 = todos). */
export function superficieTerreno(salto = 1): Cuadricula {
  let g = guardadas.get(salto)
  if (!g) {
    g = aplanar(cuadricula(terreno, salto), explanadasPlanta, TRANSICION_EXPLANADA)
    guardadas.set(salto, g)
  }
  return g
}

/** El terreno en (x, y) cambió más que la tolerancia por una explanada: las curvas de nivel naturales ya no valen ahí. */
export function terrenoModificado([x, y]: [number, number]): boolean {
  const [antes, nuevo] = [alturaEn(natural, x, y), alturaEn(superficieTerreno(1), x, y)]
  return antes !== null && nuevo !== null && Math.abs(nuevo - antes) > TOLERANCIA_TERRENO_MODIFICADO
}
