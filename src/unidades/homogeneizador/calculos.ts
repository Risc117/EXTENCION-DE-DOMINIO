import type { DatosHomogeneizador } from './esquema'

/** Área útil del espejo de agua (m²) = π·(Di/2)². */
export function areaUtil(d: DatosHomogeneizador): number {
  return Math.PI * (d.tanque.diametroInterior.valor / 2) ** 2
}

/** Volumen útil (m³) = área útil × altura útil. */
export function volumenUtil(d: DatosHomogeneizador): number {
  return areaUtil(d) * d.tanque.alturaUtil.valor
}
