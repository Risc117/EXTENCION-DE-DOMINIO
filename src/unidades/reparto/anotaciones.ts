import { DESFASES_ET_REPARTO } from '../../nucleo/constantesSedimentador'
import { ARRIBA, cotaEntre, etiquetaDe } from '../comun/anotar'
import { hayEjemplo } from '../comun/medidas'
import { resolverTexto } from '../comun/texto'
import type { CotaCalculada, EtiquetaCalculada } from '../comun/tiposAnotaciones'
import type { DatosReparto } from './esquema'

/** Parte del caudal total que recibe cada salida, en texto: 0.5 → "Q/2", 0.25 → "Q/4", 0.4 → "0.4·Q". */
export function parteDelCaudal(fraccion: number): string {
  const denominador = 1 / fraccion
  return Number.isInteger(denominador) ? `Q/${denominador}` : `${fraccion}·Q`
}

/** Cotas de la cámara: largo y ancho (de ejemplo). */
export function construirCotas(d: DatosReparto): CotaCalculada[] {
  const { largo, ancho, alto } = d.caja
  const L = largo.valor / 2
  const A = ancho.valor / 2
  return [
    cotaEntre('largo', 'Largo = {valor} m', largo.valor, largo.demo === true, [-L, alto.valor, A], [L, alto.valor, A], ARRIBA),
    cotaEntre('ancho', 'Ancho = {valor} m', ancho.valor, ancho.demo === true, [L, alto.valor, -A], [L, alto.valor, A], ARRIBA),
  ]
}

/** Etiquetas: el nombre y el caudal que manda a cada sedimentador (`fraccion` del caudal total; 0.5 = Q/2). */
export function construirEtiquetas(d: DatosReparto, caudalLs: number, fraccion: number): EtiquetaCalculada[] {
  const demo = hayEjemplo([d.caja.largo, d.caja.ancho, d.caja.alto])
  const F = DESFASES_ET_REPARTO
  const punta: [number, number, number] = [0, d.caja.alto.valor, 0]
  return [
    etiquetaDe('et-reparto', 'Cámara de reparto', demo, punta, F.nombre),
    etiquetaDe('et-reparto-caudal', resolverTexto(`Manda {valor} L/s a cada sedimentador (${parteDelCaudal(fraccion)})`, caudalLs * fraccion, false), demo, punta, F.caudal),
  ]
}
