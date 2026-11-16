import { LITROS_POR_M3 } from '../../nucleo/constantes'
import { MILILITROS_POR_LITRO, SEGUNDOS_POR_MINUTO_DESINFECCION } from '../../nucleo/constantesDesinfeccion'
import type { DatosDesinfeccion } from './esquema'

const cantidad = (d: DatosDesinfeccion): number => d.canales.cantidad.valor

/** Ancho total (m) = canales + tabiques + 2 muros (4 × 0.60 + 3 × 0.15 + 2 × 0.20 = 3.25). */
export const anchoTotal = (d: DatosDesinfeccion): number => cantidad(d) * d.canales.ancho.valor + (cantidad(d) - 1) * d.tabique.espesor.valor + 2 * d.muro.espesor.valor
/** Largo total (m) = largo interior + 2 muros (4.0 + 2 × 0.20 = 4.4). */
export const largoTotal = (d: DatosDesinfeccion): number => d.canales.largoInterior.valor + 2 * d.muro.espesor.valor
/** Ancho interior (m): lo que queda entre los muros (2.85). */
export const anchoInterior = (d: DatosDesinfeccion): number => anchoTotal(d) - 2 * d.muro.espesor.valor
/** Paso (m) que deja cada tabique en la vuelta: largo interior − largo del tabique (4.00 − 3.27 = 0.73). */
export const paso = (d: DatosDesinfeccion): number => d.canales.largoInterior.valor - d.tabique.largo.valor
/** Altura total (m): losa + agua + borde libre. */
export const alturaTotal = (d: DatosDesinfeccion): number => d.losa.espesor.valor + d.agua.profundidad.valor + d.agua.bordeLibre.valor

/** Volumen (m³) del plano: canales × ancho × largo de recorrido × profundidad (4 × 0.60 × 3.27 × 1.50, lectura de insumos/medidas-desinfeccion.md). */
export const volumenPlano = (d: DatosDesinfeccion): number => cantidad(d) * d.canales.ancho.valor * d.canales.largoRecorrido.valor * d.agua.profundidad.valor

/**
 * Nivel de agua (m sobre la losa) ilustrativo: proporcional al caudal (la profundidad h es la del caudal de diseño) y sin pasar del borde del muro.
 * Sin caudal no hay agua.
 */
export function nivelAgua(d: DatosDesinfeccion, caudalLs: number): number {
  if (caudalLs <= 0) return 0
  const nivel = (d.agua.profundidad.valor * caudalLs) / d.hidraulica.caudalDiseno.valor
  return Math.min(nivel, d.agua.profundidad.valor + d.agua.bordeLibre.valor)
}

/** Tiempo de contacto (min) = volumen / caudal; sin caudal no hay contacto (Infinity). */
export function retencionMin(volumenM3: number, caudalLs: number): number {
  if (caudalLs <= 0) return Infinity
  return volumenM3 / ((caudalLs / LITROS_POR_M3) * SEGUNDOS_POR_MINUTO_DESINFECCION)
}

/** Caudal de la solución de cloro (mL/s) = Q × DM / C, con Q en L/s y DM y C en mg/L (hoja 'DESINFECCION', celda G12). */
export function caudalSolucion(d: DatosDesinfeccion, caudalLs: number): number {
  if (caudalLs <= 0) return 0
  return ((caudalLs * d.cloracion.dosisMaxima.valor) / d.cloracion.concentracion.valor) * MILILITROS_POR_LITRO
}
