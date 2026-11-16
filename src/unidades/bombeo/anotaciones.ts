import { DESFASE_COTA_CANAL } from '../../nucleo/constantesCanales'
import { BAJADA_ET_BOMBA, BAJADA_ET_BOMBA_RESERVA, DESFASE_ET_BOMBA_X, DESFASE_ET_CASETA, DESFASE_ET_CARCAMO_X, DESFASE_ET_IMPULSION, FACTOR_DESFASE_COTA_PARADA, FRACCION_TRAMO_ET_IMPULSION, SUBIDA_ET_CARCAMO } from '../../nucleo/constantesCanales'
import { cotaEntre, etiquetaDe } from '../comun/anotar'
import { hayEjemplo } from '../comun/medidas'
import type { CotaCalculada, EtiquetaCalculada } from '../comun/tiposAnotaciones'
import { resolverTexto } from '../comun/texto'
import { disponer } from './disposicion'
import type { DatosBombeo } from './esquema'

const ejemplo = (m: { demo?: boolean }) => m.demo === true

/** Cotas del cárcamo: diámetro, profundidad y los niveles de arranque y parada de las bombas. */
export function construirCotas(d: DatosBombeo): CotaCalculada[] {
  const s = disponer(d)
  const h = s.profundidad
  const lado = (veces: number): [number, number, number] => [-DESFASE_COTA_CANAL * veces, 0, 0]
  return [
    cotaEntre('diametro', 'Ø {valor} m', d.carcamo.diametroInterior.valor, ejemplo(d.carcamo.diametroInterior), [0, h, -s.radioInterior], [0, h, s.radioInterior], [0, DESFASE_COTA_CANAL, 0]),
    cotaEntre('profundidad', 'Profundidad = {valor} m', h, ejemplo(d.carcamo.profundidad), [0, 0, -s.radioExterior], [0, h, -s.radioExterior], [0, 0, -DESFASE_COTA_CANAL]),
    cotaEntre('arranque', 'Arranque = {valor} m', d.niveles.arranque.valor, ejemplo(d.niveles.arranque), [-s.radioExterior, 0, 0], [-s.radioExterior, d.niveles.arranque.valor, 0], lado(1)),
    cotaEntre('parada', 'Parada = {valor} m', d.niveles.parada.valor, ejemplo(d.niveles.parada), [-s.radioExterior, 0, 0], [-s.radioExterior, d.niveles.parada.valor, 0], lado(FACTOR_DESFASE_COTA_PARADA)),
  ]
}

/** Etiquetas: cárcamo con el nivel actual (m), cada bomba con su estado, caseta e impulsión. */
export function construirEtiquetas(d: DatosBombeo, nivel: number, bombaActiva: number | null): EtiquetaCalculada[] {
  const s = disponer(d)
  const h = s.profundidad
  const textoBomba = (i: number) => `Bomba ${i + 1}: ${i === bombaActiva ? 'en marcha' : s.zBombas.length > 1 && bombaActiva === null ? 'parada' : 'en reserva'}`
  const etiquetas = [
    { ...etiquetaDe('et-carcamo', 'Cárcamo', false, [0, nivel, 0], [DESFASE_ET_CARCAMO_X, h + SUBIDA_ET_CARCAMO, 0]), texto: resolverTexto('Cárcamo, nivel {valor} m', nivel, false) },
    etiquetaDe('et-caseta', 'Caseta de válvulas', hayEjemplo(Object.values(d.caseta)), [s.xCaseta, h + d.caseta.alto.valor, 0], DESFASE_ET_CASETA),
    etiquetaDe('et-impulsion', `Línea de impulsión Ø${Math.round(d.impulsion.diametro.valor * 1000)}`, ejemplo(d.impulsion.largoTramo), [s.xCasetaFin + d.impulsion.largoTramo.valor * FRACCION_TRAMO_ET_IMPULSION, s.yImpulsion, 0], DESFASE_ET_IMPULSION),
  ]
  for (const [i, z] of s.zBombas.entries()) {
    etiquetas.push(etiquetaDe(`et-bomba-${i}`, textoBomba(i), hayEjemplo(Object.values(d.bombas)), [s.xBombas, d.bombas.alto.valor, z], [DESFASE_ET_BOMBA_X, h - d.bombas.alto.valor - BAJADA_ET_BOMBA - (i ? BAJADA_ET_BOMBA_RESERVA : 0), 0]))
  }
  return etiquetas
}
