import { cajaEntre as caja } from '../comun/cajas'
import type { DatosSeguridad } from '../comun/datosSeguridad'
import type { Pieza } from '../comun/tipos'
import { disponer } from './disposicion'
import type { DatosRafa } from './esquema'

const COLOR_VEREDA = '--color-acceso'
const COLOR_BARANDA = '--color-baranda'
/** Niveles de la baranda: el pasamanos de arriba y uno intermedio a media altura. */
const NIVELES = [1, 0.5] as const

/** Puntos (de −mitad a +mitad) a lo largo de un lado, a una separación igual y no mayor que `separacion`. */
const repartir = (mitad: number, separacion: number): number[] => {
  const tramos = Math.max(1, Math.ceil((2 * mitad) / separacion))
  return Array.from({ length: tramos + 1 }, (_, i) => -mitad + (2 * mitad * i) / tramos)
}

/**
 * Vereda de mantenimiento y baranda de seguridad alrededor del RAFA. La huella total (18.0 × 6.75 m) es la del plano general y la estructura mide
 * 15.2 × 5.7 m: lo que sobra del contorno es vereda, a la altura de la coronación, y la baranda va en el borde de afuera. Origen: el del RAFA.
 */
export function construirVereda(d: DatosRafa, v: DatosSeguridad['rafa']): Pieza[] {
  const s = disponer(d)
  const [X, Z] = [v.largoTotal.valor / 2, v.anchoTotal.valor / 2]
  const [ex, ez] = [s.semiLargo, s.semiAncho]
  const [y0, y1] = [s.yLosa - v.espesorVereda.valor, s.yLosa]
  const g = v.grosor.valor
  const alto = v.alturaBaranda.valor
  const losas = [
    caja('vereda-norte', COLOR_VEREDA, [-ex, ex], [y0, y1], [-Z, -ez]),
    caja('vereda-sur', COLOR_VEREDA, [-ex, ex], [y0, y1], [ez, Z]),
    caja('vereda-oeste', COLOR_VEREDA, [-X, -ex], [y0, y1], [-Z, Z]),
    caja('vereda-este', COLOR_VEREDA, [ex, X], [y0, y1], [-Z, Z]),
  ]
  // Postes en el borde de afuera: los dos lados largos (z = ±Z) y los dos cortos (x = ±X) sin repetir las esquinas.
  const puntos: [number, number][] = [
    ...repartir(X, v.separacionPostes.valor).flatMap((x): [number, number][] => [[x, -Z], [x, Z]]),
    ...repartir(Z, v.separacionPostes.valor).slice(1, -1).flatMap((z): [number, number][] => [[-X, z], [X, z]]),
  ]
  const postes = puntos.map(([x, z], i) => caja(`poste-${i + 1}`, COLOR_BARANDA, [x - g / 2, x + g / 2], [y1, y1 + alto], [z - g / 2, z + g / 2], { accesorio: true }))
  const pasamanos = NIVELES.flatMap((nivel, k) => [
    caja(`pasamanos-norte-${k + 1}`, COLOR_BARANDA, [-X, X], [y1 + alto * nivel - g, y1 + alto * nivel], [-Z - g / 2, -Z + g / 2], { accesorio: true }),
    caja(`pasamanos-sur-${k + 1}`, COLOR_BARANDA, [-X, X], [y1 + alto * nivel - g, y1 + alto * nivel], [Z - g / 2, Z + g / 2], { accesorio: true }),
    caja(`pasamanos-oeste-${k + 1}`, COLOR_BARANDA, [-X - g / 2, -X + g / 2], [y1 + alto * nivel - g, y1 + alto * nivel], [-Z, Z], { accesorio: true }),
    caja(`pasamanos-este-${k + 1}`, COLOR_BARANDA, [X - g / 2, X + g / 2], [y1 + alto * nivel - g, y1 + alto * nivel], [-Z, Z], { accesorio: true }),
  ])
  return [...losas, ...postes, ...pasamanos]
}
