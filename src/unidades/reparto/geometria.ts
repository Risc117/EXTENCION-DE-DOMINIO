import { OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { cajaEntre as caja } from '../comun/cajas'
import type { Agua, Pieza } from '../comun/tipos'
import type { DatosReparto } from './esquema'

/** Cámara de reparto: piso y cuatro muros (translúcidos con "Ver corte"). Origen: centro; y = 0 en el fondo. */
export function construirPiezas(d: DatosReparto, corte = false): Pieza[] {
  const { largo, ancho, alto, espesorMuro: e } = d.caja
  const L = largo.valor / 2
  const A = ancho.valor / 2
  const extra = corte ? { opacidad: OPACIDAD_CANAL } : {}
  return [
    caja('piso', '--color-piso', [-L, L], [0, e.valor], [-A, A]),
    caja('muro-norte', '--color-muro', [-L, L], [e.valor, alto.valor], [A - e.valor, A], extra),
    caja('muro-sur', '--color-muro', [-L, L], [e.valor, alto.valor], [-A, -A + e.valor], extra),
    caja('muro-oeste', '--color-muro', [-L, -L + e.valor], [e.valor, alto.valor], [-A + e.valor, A - e.valor], extra),
    caja('muro-este', '--color-muro', [L - e.valor, L], [e.valor, alto.valor], [-A + e.valor, A - e.valor], extra),
  ]
}

/** El agua de la cámara, al nivel de ejemplo del JSON. */
export function construirAguas(d: DatosReparto): Agua[] {
  const { largo, ancho, espesorMuro: e, nivelAgua } = d.caja
  return [{ forma: 'caja', id: 'agua', centro: [0, 0], largo: largo.valor - 2 * e.valor, ancho: ancho.valor - 2 * e.valor, y0: e.valor, nivel: nivelAgua.valor }]
}
