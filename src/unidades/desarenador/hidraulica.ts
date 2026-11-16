import { LITROS_POR_M3 } from '../../nucleo/constantes'
import type { DatosDesarenador } from './esquema'

const DOS_TERCIOS = 2 / 3

/**
 * Altura del agua (m) sobre el piso del canal para un caudal en L/s, según el vertedero Sutro de la hoja:
 * Q = C · a^0.5 · W · (H − a/3), o sea H = Q / (C · a^0.5 · W) + a/3.
 * Con poco caudal (H menor que a) la fórmula no vale; ahí el nivel crece en proporción hasta llegar a `a`.
 * Nunca pasa del muro.
 */
export function alturaAgua(d: DatosDesarenador, caudalLs: number): number {
  if (caudalLs <= 0) return 0
  const { coeficiente, alturaMinima: a, ancho: w } = d.vertedero
  const unidad = coeficiente.valor * Math.sqrt(a.valor) * w.valor
  const q = caudalLs / LITROS_POR_M3
  const caudalEnA = unidad * DOS_TERCIOS * a.valor
  const h = q < caudalEnA ? (a.valor * q) / caudalEnA : q / unidad + a.valor / 3
  return Math.min(h, d.canal.alturaSalida.valor - d.tolva.altura.valor)
}
