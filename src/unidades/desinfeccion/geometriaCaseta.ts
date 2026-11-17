import { OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { SEPARACION_RINCON_CASETA, SOBRESALE_LINEA_CASETA } from '../../nucleo/constantesDesinfeccion'
import { cajaEntre as caja } from '../comun/cajas'
import type { Pieza } from '../comun/tipos'
import type { DatosDesinfeccion } from './esquema'

/** Altura total (m) de la caseta: piso + muros + techo. */
export const alturaCaseta = (d: DatosDesinfeccion): number => d.caseta.alturaMuros.valor + 2 * d.caseta.espesor.valor

/** Posición (m) del tanque dentro de la caseta: rincón noroeste. Origen: centro de la caseta. */
export function posicionTanque(d: DatosDesinfeccion): { x: number; z: number } {
  const r = d.tanque.diametro.valor / 2
  const rincon = d.caseta.espesor.valor + SEPARACION_RINCON_CASETA + r
  return { x: -d.caseta.largo.valor / 2 + rincon, z: -d.caseta.ancho.valor / 2 + rincon }
}

/** Posición (m) del centro de la bomba dosificadora: sobre el eje de la caseta, a la altura del tanque en z; de ahí sale la línea de cloro hacia el muro sur (como en el mapa general). */
export function posicionBomba(d: DatosDesinfeccion): { x: number; z: number } {
  return { x: 0, z: posicionTanque(d).z }
}

/** Caseta de cloración: piso, cuatro muros, techo (accesorio), tanque de solución, bomba dosificadora y línea de 1/2" que sale por el muro sur. Origen: centro; y = 0 en el piso. */
export function construirPiezasCaseta(d: DatosDesinfeccion, corte = false): Pieza[] {
  const c = d.caseta
  const L = c.largo.valor / 2
  const A = c.ancho.valor / 2
  const e = c.espesor.valor
  const yTope = e + c.alturaMuros.valor
  const extra = corte ? { opacidad: OPACIDAD_CANAL } : {}
  const tanque = posicionTanque(d)
  const bomba = posicionBomba(d)
  const alturaLinea = e + d.bomba.alto.valor / 2
  const largoLinea = A + SOBRESALE_LINEA_CASETA - bomba.z
  return [
    caja('piso', '--color-piso', [-L, L], [0, e], [-A, A]),
    caja('muro-oeste', '--color-caseta', [-L, -L + e], [e, yTope], [-A, A], extra),
    caja('muro-este', '--color-caseta', [L - e, L], [e, yTope], [-A, A], extra),
    caja('muro-norte', '--color-caseta', [-L + e, L - e], [e, yTope], [-A, -A + e], extra),
    caja('muro-sur', '--color-caseta', [-L + e, L - e], [e, yTope], [A - e, A], extra),
    caja('techo', '--color-losa', [-L, L], [yTope, yTope + e], [-A, A], { accesorio: true }),
    { id: 'tanque', forma: 'cilindro', color: '--color-ingreso', pos: [tanque.x, e + d.tanque.altura.valor / 2, tanque.z], radio: d.tanque.diametro.valor / 2, alto: d.tanque.altura.valor },
    caja('bomba', '--color-agitador', [bomba.x - d.bomba.largo.valor / 2, bomba.x + d.bomba.largo.valor / 2], [e, e + d.bomba.alto.valor], [bomba.z - d.bomba.ancho.valor / 2, bomba.z + d.bomba.ancho.valor / 2]),
    { id: 'linea-cloro', forma: 'cilindro', color: '--color-impulsion', pos: [bomba.x, alturaLinea, bomba.z + largoLinea / 2], radio: d.cloracion.diametroLinea.valor / 2, alto: largoLinea, eje: 'z' },
  ]
}
