import { HORAS_POR_DIA, LITROS_POR_M3, SEGUNDOS_POR_HORA } from '../../nucleo/constantes'
import type { DatosSedimentador } from './esquema'

const SEGUNDOS_POR_MINUTO = 60

export const radioInterior = (d: DatosSedimentador): number => d.tanque.diametroInterior.valor / 2

/** Altura total (m): tolva + agua + borde libre (1.9643 + 4.50 + 0.40 = 6.8643). */
export const alturaTotal = (d: DatosSedimentador): number => d.tolva.altura.valor + d.tanque.alturaAgua.valor + d.tanque.bordoLibre.valor

/** Área superficial As = π/4 · (Ø² − Øc²) y volumen V = As · H con las medidas del plano; la hoja trae el suyo aparte. */
export const areaSuperficial = (d: DatosSedimentador): number => (Math.PI / 4) * (d.tanque.diametroInterior.valor ** 2 - d.camaraCentral.diametro.valor ** 2)
export const volumenPlano = (d: DatosSedimentador): number => areaSuperficial(d) * d.tanque.alturaAgua.valor

/** Longitud del vertedero Lv = π · Ø (m) y número de muescas (una cada `separacionMuescas`). */
export const longitudVertedero = (d: DatosSedimentador): number => Math.PI * d.tanque.diametroInterior.valor
export const muescas = (d: DatosSedimentador): number => Math.floor(longitudVertedero(d) / d.vertedero.separacionMuescas.valor)

/** Tiempo de retención (h) = volumen / caudal de la unidad; sin caudal no hay retención (Infinity). */
export function retencion(volumenM3: number, caudalLs: number): number {
  if (caudalLs <= 0) return Infinity
  return volumenM3 / ((caudalLs / LITROS_POR_M3) * SEGUNDOS_POR_HORA)
}

/** Lámina (m) en el canal perimetral según la hoja: el caudal de la unidad se reparte en los ramales del canal (2) y Y = (Q / ramales) / (VC · B). */
export function laminaCanal(d: DatosSedimentador, caudalLs: number): number {
  if (caudalLs <= 0) return 0
  return caudalLs / d.canal.ramales.valor / LITROS_POR_M3 / (d.canal.velocidad.valor * d.canal.ancho.valor)
}

/** Carga sobre el vertedero (m³/m·d) = caudal de la unidad / Lv. */
export function cargaVertedero(d: DatosSedimentador, caudalLs: number): number {
  if (caudalLs <= 0) return 0
  return ((caudalLs / LITROS_POR_M3) * HORAS_POR_DIA * SEGUNDOS_POR_HORA) / longitudVertedero(d)
}

/** Velocidad de giro (rad/s) del puente barrendero: la de ejemplo, constante. */
export const velocidadPuente = (d: DatosSedimentador): number => (d.accesorios.vueltasPorMinuto.valor * 2 * Math.PI) / SEGUNDOS_POR_MINUTO
