import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import { OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { ESPESOR_COMPUERTA_PERCOLADOR } from '../../nucleo/constantesPercolador'
import { cajaEntre as caja } from '../comun/cajas'
import type { Pieza } from '../comun/tipos'
import { disponer } from './disposicion'
import type { DatosPercolador } from './esquema'

/** Lo del lado este: cámara de salida (ancho × profundidad del plano), compuerta mural y tubería de salida. */
export function construirSalida(d: DatosPercolador): Pieza[] {
  const s = disponer(d)
  const sa = d.salida
  const xFin = s.xSalida + sa.ancho.valor
  const lado = sa.ladoCompuerta.valor
  return [
    caja('camara-salida', '--color-caseta', [s.xSalida, xFin], [0, sa.profundidad.valor], [-sa.ancho.valor / 2, sa.ancho.valor / 2], { opacidad: OPACIDAD_CANAL }),
    caja('compuerta-mural', '--color-valvula', [s.xSalida - ESPESOR_COMPUERTA_PERCOLADOR, s.xSalida], [s.yLosa, s.yLosa + lado], [-lado / 2, lado / 2], { accesorio: true }),
    { id: 'tubo-salida', forma: 'cilindro', color: '--color-salida', pos: [xFin + PROLONGACION_TUBO / 2, sa.diametroTubo.valor / 2, 0], radio: sa.diametroTubo.valor / 2, alto: PROLONGACION_TUBO, eje: 'x' },
  ]
}
