import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import { LARGO_SALIDA_EFLUENTE_RAFA, REPARTO_SALIDAS_RAFA, SEPARACION_CAJAS_RAFA, SEPARACION_TOMAS_RAFA } from '../../nucleo/constantesRafa'
import { cajaEntre as caja } from '../comun/cajas'
import type { Pieza } from '../comun/tipos'
import { disponer } from './disposicion'
import type { DatosRafa } from './esquema'
import { xTomas } from './internos'

/** Lo de afuera: caja de distribución (oeste, sobre la losa), cámara de efluente con rejilla (este), caja de muestreo y de descarga de lodo. */
export function construirExterior(d: DatosRafa): Pieza[] {
  const s = disponer(d)
  const c = d.distribucion.caja
  const L = s.semiLargo
  const piezas: Pieza[] = [
    caja('caja-distribucion', '--color-caseta', [-L, -L + c.ancho.valor], [s.yLosa, s.yLosa + c.alto.valor], [-c.ancho.valor / 2, c.ancho.valor / 2]),
    { id: 'tubo-afluente', forma: 'cilindro', color: '--color-ingreso', pos: [-L - PROLONGACION_TUBO / 2, s.yLosa + c.alto.valor / 2, 0], radio: c.diametroAfluente.valor / 2, alto: PROLONGACION_TUBO, eje: 'x' },
    { id: 'tubo-bajada', forma: 'cilindro', color: '--color-ingreso', pos: [-L + c.ancho.valor / 2, (s.yPiso + s.yLosa) / 2, 0], radio: c.diametroSalida.valor / 2, alto: s.yLosa - s.yPiso, eje: 'y', accesorio: true },
  ]
  const ef = d.efluente
  const yCamara = s.yMuros - ef.recoleccionInferior.valor
  const xFin = L + ef.anchoCamara.valor
  piezas.push(
    caja('camara-efluente', '--color-caseta', [L, xFin], [yCamara, s.yMuros], [-s.semiAnchoInterior, s.semiAnchoInterior]),
    caja('rejilla', '--color-reja', [xFin - ef.espesorRejilla.valor, xFin], [yCamara, s.yMuros - ef.recoleccionSuperior.valor], [-s.semiAnchoInterior, s.semiAnchoInterior]),
  )
  for (let i = 0; i < ef.salidas.valor; i++) {
    const z = ((i + 0.5) / ef.salidas.valor - 0.5) * 2 * s.semiAnchoInterior * REPARTO_SALIDAS_RAFA
    piezas.push({ id: `salida-efluente-${i + 1}`, forma: 'cilindro', color: '--color-salida', pos: [xFin + LARGO_SALIDA_EFLUENTE_RAFA / 2, s.yMuros - ef.recoleccionSuperior.valor, z], radio: c.diametroSalida.valor, alto: LARGO_SALIDA_EFLUENTE_RAFA, eje: 'x' })
  }
  const zCajas = s.semiAncho + SEPARACION_TOMAS_RAFA
  const lm = d.lodos.ladoCajaMuestreo.valor
  const ld = d.lodos.ladoCajaDescarga.valor
  const altoMuestreo = Math.max(...d.lodos.alturasToma.map((t) => t.valor)) + d.lodos.margenCajaMuestreo.valor
  const x = xTomas(d)
  const zDescarga = s.semiAncho + SEPARACION_CAJAS_RAFA
  piezas.push(
    caja('caja-muestreo', '--color-caseta', [x - lm / 2, x + lm / 2], [s.yPiso, s.yPiso + altoMuestreo], [-(zCajas + lm), -zCajas]),
    caja('caja-descarga', '--color-caseta', [-x - ld / 2, -x + ld / 2], [s.yPiso, s.yPiso + ld], [-(zDescarga + ld), -zDescarga]),
  )
  return piezas
}
