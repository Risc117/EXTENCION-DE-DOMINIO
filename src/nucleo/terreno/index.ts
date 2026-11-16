import crudo from '../../../datos/terreno.json'
import { esquemaTerreno } from './esquema'

export { alturaEn, cuadricula, type Cuadricula } from './altura'
export { rayoContraTerreno } from './rayo'
export { avisoDemoTerreno, textoCotaTerreno } from './formato'
export { esquemaTerreno, terrenoEsDemo, type CurvaTerreno, type DatosTerreno } from './esquema'

/** Terreno ya validado (datos/terreno.json). */
export const terreno = esquemaTerreno.parse(crudo)
