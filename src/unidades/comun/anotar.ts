import { SUBIDA_TEXTO_COTA } from '../../nucleo/constantes'
import { DESFASE_COTA_CANAL } from '../../nucleo/constantesCanales'
import { resolverTexto } from './texto'
import type { CotaCalculada, EtiquetaCalculada, Vec3 } from './tiposAnotaciones'

const medio = (a: Vec3, b: Vec3, subida = 0): Vec3 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + subida, (a[2] + b[2]) / 2]

/**
 * Cota entre dos puntos de la pieza, dibujada con un desfase `lado` (vector) para que no tape la estructura.
 * El texto lleva el valor medido (con "Dato de ejemplo" si es de ejemplo).
 */
export function cotaEntre(id: string, plantilla: string, valor: number, demo: boolean, p: Vec3, q: Vec3, lado: Vec3): CotaCalculada {
  const desplazar = (v: Vec3): Vec3 => [v[0] + lado[0], v[1] + lado[1], v[2] + lado[2]]
  const a = desplazar(p)
  const b = desplazar(q)
  return { id, texto: resolverTexto(plantilla, valor, demo), a, b, extensiones: [[p, a], [q, b]], centro: medio(a, b, SUBIDA_TEXTO_COTA) }
}

/** Vector de desfase (m) hacia arriba de las cotas horizontales. */
export const ARRIBA: Vec3 = [0, DESFASE_COTA_CANAL, 0]

/** Etiqueta con el nombre de una pieza: el texto va `separacion` (vector) lejos de `punta`, que es un punto de la pieza. */
export function etiquetaDe(id: string, texto: string, demo: boolean, punta: Vec3, separacion: Vec3): EtiquetaCalculada {
  const origen: Vec3 = [punta[0] + separacion[0], punta[1] + separacion[1], punta[2] + separacion[2]]
  return { id, texto: resolverTexto(texto, null, demo), origen, punta, interior: false, prioridad: false }
}
