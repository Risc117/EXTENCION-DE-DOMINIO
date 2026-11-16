import { GRAVEDAD, LITROS_POR_M3 } from '../../nucleo/constantes'
import type { DatosParshall } from './esquema'

/** Carga Ho (m) en el punto de medición según la hoja: Ho = K · Q^m, con Q en m³/s. */
export function cargaHo(d: DatosParshall, caudalLs: number): number {
  if (caudalLs <= 0) return 0
  return d.hidraulica.coeficiente.valor * (caudalLs / LITROS_POR_M3) ** d.hidraulica.exponente.valor
}

/** Profundidad crítica (m) en la garganta: (q² / g)^(1/3), con q = Q / W. Es la lámina que se dibuja en la garganta (el resalto no se modela). */
export function profundidadGarganta(d: DatosParshall, caudalLs: number): number {
  if (caudalLs <= 0) return 0
  const q = (caudalLs / LITROS_POR_M3) / d.garganta.ancho.valor
  return Math.cbrt((q * q) / GRAVEDAD)
}
