import { DECIMALES_COTA_TERRENO, TEXTO_DATO_EJEMPLO } from '../constantes'
import { TEXTO_TERRENO as T } from '../textos'
import { terrenoEsDemo, type DatosTerreno } from './esquema'

/** Cota del terreno para mostrar, con su unidad. */
export const textoCotaTerreno = (cota: number): string => `${cota.toFixed(DECIMALES_COTA_TERRENO)} ${T.unidad}`

/** Aviso de dato de ejemplo del terreno (la altura del muro), o null si todo viene del plano. */
export const avisoDemoTerreno = (t: DatosTerreno): string | null => (terrenoEsDemo(t) ? `${TEXTO_DATO_EJEMPLO}: ${T.muroEjemplo}` : null)
