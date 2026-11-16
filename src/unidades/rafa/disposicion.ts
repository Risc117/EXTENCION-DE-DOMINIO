import type { DatosRafa } from './esquema'
import { alturaInterior, alturaTotal, anchoInterior, largoInterior } from './hidraulica'

/** Dónde cae cada cosa del RAFA. Origen: centro en planta; y = 0 en el fondo del piso; x = largo (oeste −, este +); z = ancho. */
export interface DisposicionRafa {
  semiLargo: number
  semiAncho: number
  semiLargoInterior: number
  semiAnchoInterior: number
  /** y del piso terminado (arriba del piso), de la coronación de los muros y de la parte alta de la losa. */
  yPiso: number
  yMuros: number
  yLosa: number
  alturaInterior: number
  /** Ancho (z) de cada módulo y x del centro de cada uno en su fila (de oeste a este). */
  anchoModulo: number
  xModulos: number[]
  /** z del centro de cada fila de módulos. */
  zFilas: number[]
}

export function disponer(d: DatosRafa): DisposicionRafa {
  const c = d.cuerpo
  const m = d.sedimentacion.modulos
  const porLado = m.cantidad.valor / 4
  const mitadColector = d.distribucion.anchoColector.valor / 2
  const lado = (i: number) => mitadColector + (i + 0.5) * m.largo.valor
  const oeste = Array.from({ length: porLado }, (_, i) => -lado(porLado - 1 - i))
  const este = Array.from({ length: porLado }, (_, i) => lado(i))
  const separacion = m.separacionEje.valor
  const yPiso = c.espesorPiso.valor
  return {
    semiLargo: c.largoExterior.valor / 2,
    semiAncho: c.anchoExterior.valor / 2,
    semiLargoInterior: largoInterior(d) / 2,
    semiAnchoInterior: anchoInterior(d) / 2,
    yPiso,
    yMuros: alturaTotal(d),
    yLosa: alturaTotal(d) + d.losa.espesor.valor,
    alturaInterior: alturaInterior(d),
    // Entre las dos filas queda un hueco de un espesor de deflector: es la zona de gases entre las campanas.
    anchoModulo: separacion - d.sedimentacion.espesorDeflector.valor,
    xModulos: [...oeste, ...este],
    zFilas: [-separacion / 2, separacion / 2],
  }
}
