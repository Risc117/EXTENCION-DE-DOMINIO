import { DESFASE_COTA_CANAL } from '../../nucleo/constantesCanales'
import { DESFASE_ET_CONVERGENTE, DESFASE_ET_DIVERGENTE, DESFASE_ET_GARGANTA, DESFASE_ET_MEDIDOR, SUBIDA_PUNTA_MEDIDOR } from '../../nucleo/constantesCanales'
import { ARRIBA, cotaEntre, etiquetaDe } from '../comun/anotar'
import type { CotaCalculada, EtiquetaCalculada, Vec3 } from '../comun/tiposAnotaciones'
import { resolverTexto } from '../comun/texto'
import { disponer } from './disposicion'
import type { DatosParshall } from './esquema'

const ejemplo = (m: { demo?: boolean }) => m.demo === true

/** Cotas de la canaleta: anchos de entrada, garganta y salida, largos de garganta y divergente, y los desniveles N y K. */
export function construirCotas(d: DatosParshall): CotaCalculada[] {
  const s = disponer(d)
  const h = d.estructura.alturaMuro.valor
  const atras: Vec3 = [0, 0, -(s.semiancho + DESFASE_COTA_CANAL)]
  const arribaLado: Vec3 = [0, DESFASE_COTA_CANAL, 0]
  return [
    cotaEntre('ancho-entrada', 'D = {valor} m', s.anchoEntrada, ejemplo(d.convergente.anchoEntrada), [s.xConvergente, h, -s.anchoEntrada / 2], [s.xConvergente, h, s.anchoEntrada / 2], ARRIBA),
    cotaEntre('garganta-ancho', 'W = {valor} m', s.anchoGarganta, ejemplo(d.garganta.ancho), [s.xGarganta, h, -s.anchoGarganta / 2], [s.xGarganta, h, s.anchoGarganta / 2], ARRIBA),
    cotaEntre('ancho-salida', 'C = {valor} m', s.anchoSalida, ejemplo(d.divergente.anchoSalida), [s.xSalida, h, -s.anchoSalida / 2], [s.xSalida, h, s.anchoSalida / 2], ARRIBA),
    cotaEntre('garganta-largo', 'T = {valor} m', d.garganta.largo.valor, ejemplo(d.garganta.largo), [s.xGarganta, h, s.semiancho], [s.xDivergente, h, s.semiancho], arribaLado),
    cotaEntre('divergente-largo', 'M = {valor} m', d.divergente.largo.valor, ejemplo(d.divergente.largo), [s.xDivergente, h, s.semiancho], [s.xSalida, h, s.semiancho], arribaLado),
    cotaEntre('caida', 'N = {valor} m', d.garganta.caida.valor, ejemplo(d.garganta.caida), [s.xConvergente, 0, -s.semiancho], [s.xConvergente, d.garganta.caida.valor, -s.semiancho], atras),
    cotaEntre('subida', 'K = {valor} m', d.divergente.subida.valor, ejemplo(d.divergente.subida), [s.xSalida, 0, -s.semiancho], [s.xSalida, d.divergente.subida.valor, -s.semiancho], atras),
  ]
}

/** Etiquetas de las secciones y del medidor de nivel, que muestra la carga Ho de ese instante (m). */
export function construirEtiquetas(d: DatosParshall, ho: number): EtiquetaCalculada[] {
  const s = disponer(d)
  const h = d.estructura.alturaMuro.valor
  const n = d.garganta.caida.valor
  const medidor = etiquetaDe('et-medidor', 'Medidor de nivel', false, [s.xMedicion, n + SUBIDA_PUNTA_MEDIDOR, -s.anchoEntrada / 2], DESFASE_ET_MEDIDOR)
  return [
    etiquetaDe('et-convergente', 'Sección convergente', false, [(s.xConvergente + s.xGarganta) / 2, h, s.anchoEntrada / 4], DESFASE_ET_CONVERGENTE),
    etiquetaDe('et-garganta', 'Garganta', false, [(s.xGarganta + s.xDivergente) / 2, h, 0], DESFASE_ET_GARGANTA),
    etiquetaDe('et-divergente', 'Sección divergente', false, [(s.xDivergente + s.xSalida) / 2, h, s.anchoSalida / 4], DESFASE_ET_DIVERGENTE),
    { ...medidor, texto: resolverTexto('Medidor de nivel: Ho = {valor} m', ho, false) },
  ]
}
