import { DECIMALES_COTA } from '../../nucleo/constantes'
import { TEXTO_ANOTACIONES } from '../../nucleo/textos'

/** Pone el valor (con sus decimales) donde la plantilla dice {valor}, y marca los datos de ejemplo. */
export function resolverTexto(plantilla: string, valor: number | null, demo: boolean): string {
  const texto = valor === null ? plantilla : plantilla.replaceAll('{valor}', valor.toFixed(DECIMALES_COTA))
  return demo ? texto + TEXTO_ANOTACIONES.sufijoEjemplo : texto
}
