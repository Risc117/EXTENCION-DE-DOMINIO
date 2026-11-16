import { DESFASE_COTA_CANAL } from '../../nucleo/constantesCanales'
import { CORRIMIENTO_ET_TOLVA, DESFASE_ET_CANAL, SUBIDA_PUNTA_ET_CANAL, DESFASE_ET_SUTRO, DESFASE_ET_TOLVA, DESFASE_ET_TRANSICION } from '../../nucleo/constantesCanales'
import { ARRIBA, cotaEntre, etiquetaDe } from '../comun/anotar'
import type { CotaCalculada, EtiquetaCalculada, Vec3 } from '../comun/tiposAnotaciones'
import { disponer } from './disposicion'
import type { DatosDesarenador } from './esquema'

/** Cotas del desarenador: ancho de canal, muro central, largo, transición, altura de la tolva y ancho del vertedero. */
export function construirCotas(d: DatosDesarenador): CotaCalculada[] {
  const s = disponer(d)
  const h = d.canal.alturaMuro.valor
  const b = d.canal.ancho.valor
  const zc = s.zCanales[0]
  const afuera: Vec3 = [0, 0, -(s.semiancho + DESFASE_COTA_CANAL)]
  const demo = (m: { demo?: boolean }) => m.demo === true
  const cotas = [
    cotaEntre('ancho-canal', 'B = {valor} m', b, demo(d.canal.ancho), [s.xInicio, h, zc - b / 2], [s.xInicio, h, zc + b / 2], [-DESFASE_COTA_CANAL, 0, 0]),
    cotaEntre('largo-canal', 'Largo del canal = {valor} m', d.canal.largo.valor, demo(d.canal.largo), [s.xCanal, h, s.semiancho], [s.xVertedero, h, s.semiancho], [0, DESFASE_COTA_CANAL, DESFASE_COTA_CANAL]),
    cotaEntre('transicion', 'Transición = {valor} m', d.transicion.largo.valor, demo(d.transicion.largo), [s.xInicio, h, s.semiancho], [s.xCanal, h, s.semiancho], [0, DESFASE_COTA_CANAL, DESFASE_COTA_CANAL]),
    cotaEntre('tolva', 'Tolva h = {valor} m', d.tolva.altura.valor, demo(d.tolva.altura), [s.xCanal, 0, zc - b / 2], [s.xCanal, d.tolva.altura.valor, zc - b / 2], [0, 0, afuera[2]]),
    cotaEntre('vertedero', 'Sutro W = {valor} m', d.vertedero.ancho.valor, demo(d.vertedero.ancho), [s.xVertedero, h, zc - d.vertedero.ancho.valor / 2], [s.xVertedero, h, zc + d.vertedero.ancho.valor / 2], ARRIBA),
  ]
  if (s.zCanales.length > 1) {
    const ec = d.canal.espesorMuroCentral.valor
    cotas.push(cotaEntre('muro-central', 'Muro central = {valor} m', ec, demo(d.canal.espesorMuroCentral), [s.xInicio, h, -ec / 2], [s.xInicio, h, ec / 2], [-DESFASE_COTA_CANAL, DESFASE_COTA_CANAL, 0]))
  }
  return cotas
}

/** Etiquetas con el nombre de cada pieza. */
export function construirEtiquetas(d: DatosDesarenador): EtiquetaCalculada[] {
  const s = disponer(d)
  const t = d.tolva.altura.valor
  const centro = (s.xCanal + s.xVertedero) / 2
  return [
    etiquetaDe('et-canal', 'Canales del desarenador', false, [centro, t + SUBIDA_PUNTA_ET_CANAL, 0], DESFASE_ET_CANAL),
    etiquetaDe('et-tolva', 'Tolva de arena', false, [centro + CORRIMIENTO_ET_TOLVA, t / 2, 0], DESFASE_ET_TOLVA),
    etiquetaDe('et-sutro', 'Vertedero Sutro', false, [s.xVertedero, t + d.vertedero.alturaMinima.valor, 0], DESFASE_ET_SUTRO),
    etiquetaDe('et-transicion', 'Zona de transición', false, [(s.xInicio + s.xCanal) / 2, t, 0], DESFASE_ET_TRANSICION),
  ]
}
