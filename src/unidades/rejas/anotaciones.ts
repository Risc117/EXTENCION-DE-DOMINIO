import { DESFASE_COTA_CANAL } from '../../nucleo/constantesCanales'
import { DESFASE_ET_BYPASS, DESFASE_ET_RECEPCION, DESFASE_ET_REJAS } from '../../nucleo/constantesCanales'
import { ARRIBA, cotaEntre, etiquetaDe } from '../comun/anotar'
import { hayEjemplo } from '../comun/medidas'
import type { CotaCalculada, EtiquetaCalculada, Vec3 } from '../comun/tiposAnotaciones'
import { disponer } from './disposicion'
import type { DatosRejas } from './esquema'

/** Cotas de la cámara de rejas: ancho del canal, transición, altura y largo de la reja, y vertedero del by-pass. */
export function construirCotas(d: DatosRejas): CotaCalculada[] {
  const s = disponer(d)
  const h = d.canal.alturaMuro.valor
  const b = d.canal.ancho.valor
  const reja = d.reja
  const angulo = (reja.angulo.valor * Math.PI) / 180
  const afuera: Vec3 = [0, 0, -(b / 2 + d.canal.espesorMuro.valor + DESFASE_COTA_CANAL)]
  const pie: Vec3 = [s.xPieReja, 0, -b / 2]
  return [
    cotaEntre('ancho-canal', 'B = {valor} m', b, d.canal.ancho.demo === true, [s.xSalida, h, -b / 2], [s.xSalida, h, b / 2], ARRIBA),
    cotaEntre('transicion', 'Transición = {valor} m', d.transicion.largo.valor, d.transicion.largo.demo === true, [s.xTransicion, h, -b / 2], [s.xReja, h, -b / 2], ARRIBA),
    cotaEntre('altura-reja', 'Altura de reja = {valor} m', reja.altura.valor, reja.altura.demo === true, pie, [pie[0] + reja.altura.valor / Math.tan(angulo), reja.altura.valor, pie[2]], afuera),
    cotaEntre('largo-reja', 'Largo de reja = {valor} m', reja.largo.valor, reja.largo.demo === true, pie, [pie[0] + reja.largo.valor * Math.cos(angulo), reja.largo.valor * Math.sin(angulo), pie[2]], [0, 0, afuera[2] - DESFASE_COTA_CANAL]),
    cotaEntre('vertedero', 'Vertedero by-pass = {valor} m', d.bypass.largoVertedero.valor, d.bypass.largoVertedero.demo === true, [s.xVertedero[0], d.bypass.alturaCresta.valor, s.zMuroDivisorio], [s.xVertedero[1], d.bypass.alturaCresta.valor, s.zMuroDivisorio], ARRIBA),
  ]
}

/** Etiquetas con el nombre de cada pieza (con "Dato de ejemplo" si sus medidas lo son). */
export function construirEtiquetas(d: DatosRejas): EtiquetaCalculada[] {
  const s = disponer(d)
  const h = d.canal.alturaMuro.valor
  const centroReja: Vec3 = [(s.xPieReja + s.xCabezaReja) / 2, d.reja.altura.valor / 2, 0]
  return [
    etiquetaDe('et-recepcion', 'Caja de recepción', hayEjemplo([d.recepcion.largo, d.recepcion.ancho]), [(s.xRecepcion + s.xTransicion) / 2, h, 0], DESFASE_ET_RECEPCION),
    etiquetaDe('et-rejas', 'Rejas inclinadas 45°', hayEjemplo([d.reja.angulo, d.reja.largo]), centroReja, DESFASE_ET_REJAS),
    etiquetaDe('et-bypass', 'By-pass', hayEjemplo([d.bypass.anchoCanal, d.bypass.alturaCresta]), [(s.xVertedero[0] + s.xVertedero[1]) / 2, h, s.zBypass], DESFASE_ET_BYPASS),
  ]
}
