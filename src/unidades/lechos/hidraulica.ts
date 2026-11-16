import type { DatosLechos } from './esquema'

/** Ancho y largo exteriores (m): interior + 2 muros (11.40 × 15.40). */
export const anchoExterior = (d: DatosLechos): number => d.lecho.anchoInterior.valor + 2 * d.muro.espesor.valor
export const largoExterior = (d: DatosLechos): number => d.lecho.largoInterior.valor + 2 * d.muro.espesor.valor
/** Ancho (m) de cada mitad de lecho, a cada lado del dren: (11.00 − 0.80) / 2 = 5.10. */
export const mitadAncho = (d: DatosLechos): number => (d.lecho.anchoInterior.valor - d.dren.ancho.valor) / 2
/** Área útil (m²) por lecho según el plano (11 × 15 = 165); la hoja trae su propio valor aparte. */
export const areaPlano = (d: DatosLechos): number => d.lecho.anchoInterior.valor * d.lecho.largoInterior.valor
/** Suma (m) de los espesores de las 5 capas. */
export const espesorCapas = (d: DatosLechos): number => d.capas.ladrillo.espesor.valor + d.capas.arena.espesor.valor + d.capas.gravaFina.espesor.valor + d.capas.gravaMedia.espesor.valor + d.capas.gravaGruesa.espesor.valor
/** Ángulo (grados) del piso hacia el dren, desde la pendiente en %. */
export const pendienteGrados = (d: DatosLechos): number => (Math.atan(d.piso.pendiente.valor / 100) * 180) / Math.PI

/** Fracción del ciclo que dura el secado (el lodo sube); el resto es la remoción (el lodo baja). Semanas de la hoja. */
const fraccionSecado = (d: DatosLechos): number => d.hoja.secadoSemanas.valor / (d.hoja.secadoSemanas.valor + d.hoja.remocionSemanas.valor)

/**
 * Nivel de lodo (m) de ejemplo según la hora simulada: un ciclo completo dura `horasPorCiclo` horas de simulación;
 * sube durante el secado, baja durante la remoción y vuelve a cero al terminar.
 */
export function nivelLodo(d: DatosLechos, hora: number): number {
  const ciclo = d.lodo.horasPorCiclo.valor
  const fase = (((hora % ciclo) + ciclo) % ciclo) / ciclo
  const secado = fraccionSecado(d)
  const fraccion = fase < secado ? fase / secado : 1 - (fase - secado) / (1 - secado)
  return d.lodo.alturaMaxima.valor * fraccion
}
