import { LITROS_POR_M3 } from '../../nucleo/constantes'
import type { DatosRejas } from './esquema'

/** Tirante (m) en el canal de rejas para un caudal en L/s: Q / (Vc · B), con Vc y B de la hoja. Nunca pasa del muro. */
export function tirante(d: DatosRejas, caudalLs: number): number {
  if (caudalLs <= 0) return 0
  const t = (caudalLs / LITROS_POR_M3) / (d.hidraulica.velocidadCanal.valor * d.canal.ancho.valor)
  return Math.min(t, d.canal.alturaMuro.valor)
}

/** Agua que pasa por encima del vertedero del by-pass (m de lámina sobre la cresta); 0 si no rebasa. */
export function laminaBypass(d: DatosRejas, caudalLs: number): number {
  return Math.max(0, tirante(d, caudalLs) - d.bypass.alturaCresta.valor)
}
