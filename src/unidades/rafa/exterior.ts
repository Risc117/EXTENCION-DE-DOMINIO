import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import { LARGO_SALIDA_EFLUENTE_RAFA, REPARTO_SALIDAS_RAFA, SEPARACION_CAJAS_RAFA, SEPARACION_TOMAS_RAFA } from '../../nucleo/constantesRafa'
import { cajaEntre as caja } from '../comun/cajas'
import type { Pieza } from '../comun/tipos'
import { disponer } from './disposicion'
import type { DatosRafa } from './esquema'
import { xTomas } from './internos'

/**
 * Lo de afuera, según el plano de detalle (el eje A-A cruza el RAFA por la mitad de su largo): la caja de distribución va centrada sobre A-A,
 * pegada por fuera al lado oeste (−z); la cámara de efluente con rejilla, en el lado opuesto (este, +z), también centrada sobre A-A;
 * y las cajas de muestreo y de descarga de lodo, al este. El oeste y el este son los del mapa general.
 */
export function construirExterior(d: DatosRafa): Pieza[] {
  const s = disponer(d)
  const c = d.distribucion.caja
  const A = s.semiAncho
  const zCaja = -A - c.ancho.valor / 2
  const piezas: Pieza[] = [
    caja('caja-distribucion', '--color-caseta', [-c.ancho.valor / 2, c.ancho.valor / 2], [s.yLosa, s.yLosa + c.alto.valor], [-A - c.ancho.valor, -A]),
    { id: 'tubo-afluente', forma: 'cilindro', color: '--color-ingreso', pos: [0, s.yLosa + c.alto.valor / 2, -A - c.ancho.valor - PROLONGACION_TUBO / 2], radio: c.diametroAfluente.valor / 2, alto: PROLONGACION_TUBO, eje: 'z' },
    // De la caja baja un tubo por fuera del muro y sigue recto sobre A-A, a la altura del colector, hasta el centro.
    { id: 'tubo-bajada', forma: 'cilindro', color: '--color-ingreso', pos: [0, (s.yPiso + s.yLosa) / 2, zCaja], radio: c.diametroSalida.valor / 2, alto: s.yLosa - s.yPiso, eje: 'y', accesorio: true },
    { id: 'tubo-distribucion', forma: 'cilindro', color: '--color-ingreso', pos: [0, s.yPiso + d.distribucion.colector.alturaSobrePiso.valor, zCaja / 2], radio: c.diametroSalida.valor / 2, alto: -zCaja, eje: 'z', accesorio: true },
  ]
  const ef = d.efluente
  const yCamara = s.yMuros - ef.recoleccionInferior.valor
  const zFin = A + ef.anchoCamara.valor
  piezas.push(
    caja('camara-efluente', '--color-caseta', [-s.semiAnchoInterior, s.semiAnchoInterior], [yCamara, s.yMuros], [A, zFin]),
    caja('rejilla', '--color-reja', [-s.semiAnchoInterior, s.semiAnchoInterior], [yCamara, s.yMuros - ef.recoleccionSuperior.valor], [zFin - ef.espesorRejilla.valor, zFin]),
  )
  for (let i = 0; i < ef.salidas.valor; i++) {
    const x = ((i + 0.5) / ef.salidas.valor - 0.5) * 2 * s.semiAnchoInterior * REPARTO_SALIDAS_RAFA
    piezas.push({ id: `salida-efluente-${i + 1}`, forma: 'cilindro', color: '--color-salida', pos: [x, s.yMuros - ef.recoleccionSuperior.valor, zFin + LARGO_SALIDA_EFLUENTE_RAFA / 2], radio: c.diametroSalida.valor, alto: LARGO_SALIDA_EFLUENTE_RAFA, eje: 'z' })
  }
  const zCajas = s.semiAncho + SEPARACION_TOMAS_RAFA
  const lm = d.lodos.ladoCajaMuestreo.valor
  const ld = d.lodos.ladoCajaDescarga.valor
  const altoMuestreo = Math.max(...d.lodos.alturasToma.map((t) => t.valor)) + d.lodos.margenCajaMuestreo.valor
  const x = xTomas(d)
  const zDescarga = s.semiAncho + SEPARACION_CAJAS_RAFA
  piezas.push(
    caja('caja-muestreo', '--color-caseta', [x - lm / 2, x + lm / 2], [s.yPiso, s.yPiso + altoMuestreo], [zCajas, zCajas + lm]),
    caja('caja-descarga', '--color-caseta', [-x - ld / 2, -x + ld / 2], [s.yPiso, s.yPiso + ld], [zDescarga, zDescarga + ld]),
  )
  return piezas
}
