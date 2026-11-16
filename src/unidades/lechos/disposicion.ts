import type { DatosLechos } from './esquema'
import { anchoExterior, espesorCapas, mitadAncho } from './hidraulica'

/** Medidas clave. Origen: centro del conjunto; x a lo ancho (el dren al medio de cada lecho), z a lo largo del dren; y = 0 en el piso junto al dren. */
export interface DisposicionLechos {
  n: number
  /** Mitad del ancho y del largo interiores, espesor del muro, mitad del dren, espesor de las paredes del dren y del piso, profundidad del dren. */
  mitadX: number
  mitadZ: number
  muro: number
  xDren: number
  pared: number
  profundidadDren: number
  /** Altura (m) del tope de las capas sobre el piso junto al dren, y del borde del muro. */
  yCapas: number
  yMuro: number
  /** Ángulo (rad) del piso y subida (m) que gana hacia el muro. */
  angulo: number
  subida: number
  /** x del centro del lecho i (1 a n), con el conjunto centrado en el origen. */
  centro: (i: number) => number
  /** Ancho total (m) del conjunto de lechos. */
  anchoConjunto: number
}

export function disponer(d: DatosLechos): DisposicionLechos {
  const n = d.lecho.cantidad.valor
  const paso = anchoExterior(d) + d.lecho.separacion.valor
  const angulo = Math.atan(d.piso.pendiente.valor / 100)
  return {
    n,
    mitadX: d.lecho.anchoInterior.valor / 2,
    mitadZ: d.lecho.largoInterior.valor / 2,
    muro: d.muro.espesor.valor,
    xDren: d.dren.ancho.valor / 2,
    pared: d.dren.espesorPared.valor,
    profundidadDren: d.dren.profundidad.valor,
    yCapas: espesorCapas(d),
    yMuro: espesorCapas(d) + d.muro.alturaSobreTerreno.valor,
    angulo,
    subida: Math.tan(angulo) * mitadAncho(d),
    centro: (i) => (i - (n + 1) / 2) * paso,
    anchoConjunto: n * anchoExterior(d) + (n - 1) * d.lecho.separacion.valor,
  }
}
