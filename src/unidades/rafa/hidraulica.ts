import { LITROS_POR_M3, SEGUNDOS_POR_HORA } from '../../nucleo/constantes'
import { EXPONENTE_VERTEDERO_RAFA } from '../../nucleo/constantesRafa'
import type { DatosRafa } from './esquema'

/** Altura interior (m): bordo libre + lámina + canaleta + sedimentación + digestor (corte A-A y B-B: 6.65). */
export function alturaInterior(d: DatosRafa): number {
  const c = d.cuerpo
  return c.bordoLibre.valor + c.alturaCanaleta.valor + c.alturaLaminaAgua.valor + c.alturaSedimentacion.valor + c.alturaDigestor.valor
}

/** Altura total (m) con el piso: 7.25 m. */
export const alturaTotal = (d: DatosRafa): number => alturaInterior(d) + d.cuerpo.espesorPiso.valor

export const anchoInterior = (d: DatosRafa): number => d.cuerpo.anchoExterior.valor - 2 * d.cuerpo.espesorMuro.valor
export const largoInterior = (d: DatosRafa): number => d.cuerpo.largoExterior.valor - 2 * d.cuerpo.espesorMuro.valor

/** Volumen del digestor (m³) con las medidas del plano: interior × altura del digestor (4.50 × 14.00 × 4.00 = 252). */
export const volumenPlano = (d: DatosRafa): number => anchoInterior(d) * largoInterior(d) * d.cuerpo.alturaDigestor.valor

/** Tiempo de retención (h) = volumen / caudal; sin caudal no hay retención (Infinity). */
function retencion(volumenM3: number, caudalLs: number): number {
  if (caudalLs <= 0) return Infinity
  return volumenM3 / ((caudalLs / LITROS_POR_M3) * SEGUNDOS_POR_HORA)
}

/** TR con el volumen de la hoja (259.2 m³): ≈ 11.0 h a Qp. */
export const retencionHoja = (d: DatosRafa, caudalLs: number): number => retencion(d.hidraulica.volumenHoja.valor, caudalLs)

/** TR con el volumen del plano (252 m³); se muestra aparte del de la hoja. */
export const retencionPlano = (d: DatosRafa, caudalLs: number): number => retencion(volumenPlano(d), caudalLs)

/**
 * Nivel del agua (m sobre el piso). Parte del borde de las canaletas (digestor + sedimentación + canaleta = 6.10 m) y sube la lámina
 * de vertedero como (Q/Qmh)^(2/3), hasta 0.40 m a Qmh (6.50 m, que deja el bordo libre de 0.15 m). Modelo de ejemplo.
 */
export function nivelAgua(d: DatosRafa, caudalLs: number, caudalMaximoLs: number): number {
  const c = d.cuerpo
  const base = c.alturaDigestor.valor + c.alturaSedimentacion.valor + c.alturaCanaleta.valor
  const relacion = Math.min(Math.max(caudalLs, 0) / caudalMaximoLs, 1)
  return base + c.alturaLaminaAgua.valor * relacion ** EXPONENTE_VERTEDERO_RAFA
}
