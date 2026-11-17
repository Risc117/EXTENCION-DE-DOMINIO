import crudo from '../../../datos/terreno.json'
import { esquemaTerreno } from './esquema'

export * from './constantes'
export { alturaEn, cuadricula, type Cuadricula } from './altura'
export { rayoContraTerreno } from './rayo'
export { aplanar, type Explanada } from './explanada'
export { recortarCuadricula, recortarSegmento, ventanaDe, type Ventana } from './recorte'
export { avisoDemoTerreno, textoCotaTerreno } from './formato'
export { esquemaTerreno, terrenoEsDemo, type CurvaTerreno, type DatosTerreno } from './esquema'

/** Terreno ya validado (datos/terreno.json). */
export const terreno = esquemaTerreno.parse(crudo)
export { nivelarFuentes, type FuenteNivel, type InformeNivel, type OpcionesNivel } from './nivelacion'
