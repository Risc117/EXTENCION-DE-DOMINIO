import type { DatosDesinfeccion } from './esquema'
import { anchoInterior, largoTotal, paso } from './hidraulica'

/** Medidas clave de la cámara de contacto. Origen: centro; x a lo largo de los canales (este +), z a lo ancho (sur +, canal 1 al norte, como en el mapa general); y = 0 en el fondo de la losa. */
export interface DisposicionContacto {
  /** Mitad del largo y del ancho exteriores, y del interior. */
  mitadLargo: number
  mitadAncho: number
  mitadLargoInterior: number
  mitadAnchoInterior: number
  /** y de la cara de arriba de la losa, de la superficie del agua de diseño y del borde de los muros. */
  yLosa: number
  yAgua: number
  yTope: number
  /** z del centro del canal n (1 a 4) y del tabique k (1 a 3). */
  zCanal: (n: number) => number
  zTabique: (k: number) => number
  /** Sentido del flujo en el canal n: +1 hacia el este (canal 1 y 3), −1 hacia el oeste (canal 2 y 4). */
  sentido: (n: number) => 1 | -1
  /** x del paso k (1 a 3): el 1 y el 3 al este, el 2 al oeste. Centro del hueco. */
  xPaso: (k: number) => number
  /** x del centro del tabique k: el 1 y el 3 pegados al muro oeste, el 2 pegado al este. */
  xTabique: (k: number) => number
}

export function disponer(d: DatosDesinfeccion): DisposicionContacto {
  const b = d.canales.ancho.valor
  const t = d.tabique.espesor.valor
  const mitadAnchoInterior = anchoInterior(d) / 2
  const mitadLargoInterior = d.canales.largoInterior.valor / 2
  const yLosa = d.losa.espesor.valor
  const largoTabique = d.tabique.largo.valor
  const hueco = paso(d)
  // Canal 1 al norte (z negativo): en el mapa general el afluente entra por el oeste en la esquina norte y la salida sale por el oeste en la esquina sur.
  // Cada canal siguiente va una vuelta (b + t) más al sur.
  const zCanal = (n: number): number => -(mitadAnchoInterior - b / 2 - (n - 1) * (b + t))
  const zTabique = (k: number): number => -(mitadAnchoInterior - b - t / 2 - (k - 1) * (b + t))
  const alOeste = (k: number): boolean => k % 2 === 1
  return {
    mitadLargo: largoTotal(d) / 2,
    mitadAncho: (anchoInterior(d) + 2 * d.muro.espesor.valor) / 2,
    mitadLargoInterior,
    mitadAnchoInterior,
    yLosa,
    yAgua: yLosa + d.agua.profundidad.valor,
    yTope: yLosa + d.agua.profundidad.valor + d.agua.bordeLibre.valor,
    zCanal,
    zTabique,
    sentido: (n) => (n % 2 === 1 ? 1 : -1),
    xPaso: (k) => (alOeste(k) ? mitadLargoInterior - hueco / 2 : -mitadLargoInterior + hueco / 2),
    xTabique: (k) => (alOeste(k) ? -mitadLargoInterior + largoTabique / 2 : mitadLargoInterior - largoTabique / 2),
  }
}
