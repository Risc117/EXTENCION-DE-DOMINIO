import type { DatosDesarenador } from './esquema'

/** Dónde cae cada tramo a lo largo del flujo (x, desde el centro de la unidad). El canal va centrado en z = 0. */
export interface DisposicionDesarenador {
  largoTotal: number
  xInicio: number
  /** Donde termina la transición y empieza el canal de sedimentación. */
  xCanal: number
  /** Cara de aguas arriba del muro del vertedero. */
  xVertedero: number
  /** Cara de aguas abajo del muro del vertedero. */
  xSalida: number
  xFin: number
  /** Semiancho exterior (m): del eje al lado de afuera de un muro lateral. */
  semiancho: number
  /** z del centro de cada canal (el conjunto está centrado en z = 0). */
  zCanales: number[]
}

export function disponer(d: DatosDesarenador): DisposicionDesarenador {
  const e = d.canal.espesorMuro.valor
  const largoTotal = d.transicion.largo.valor + d.canal.largo.valor + e + d.salida.largo.valor
  const xInicio = -largoTotal / 2
  const xCanal = xInicio + d.transicion.largo.valor
  const xVertedero = xCanal + d.canal.largo.valor
  const n = d.canal.numero.valor
  const paso = d.canal.ancho.valor + d.canal.espesorMuroCentral.valor
  const zCanales = Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * paso)
  const semiancho = (n * d.canal.ancho.valor + (n - 1) * d.canal.espesorMuroCentral.valor) / 2 + e
  return { largoTotal, xInicio, xCanal, xVertedero, xSalida: xVertedero + e, xFin: xInicio + largoTotal, semiancho, zCanales }
}
