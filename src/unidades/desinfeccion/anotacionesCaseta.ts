import { DESFASE_COTA_CANAL } from '../../nucleo/constantesCanales'
import { DESFASES_ET_CASETA_CLORO, DIECISEISAVOS, MM_POR_M_DESINFECCION, MM_POR_PULGADA } from '../../nucleo/constantesDesinfeccion'
import { ARRIBA, cotaEntre, etiquetaDe } from '../comun/anotar'
import { hayEjemplo } from '../comun/medidas'
import { resolverTexto } from '../comun/texto'
import type { CotaCalculada, EtiquetaCalculada } from '../comun/tiposAnotaciones'
import type { DatosDesinfeccion } from './esquema'
import { alturaCaseta, posicionBomba, posicionTanque } from './geometriaCaseta'
import { caudalSolucion } from './hidraulica'

const ejemplo = (m: { demo?: boolean }) => m.demo === true

/** Diámetro en pulgadas como fracción: 0.0127 m → 1/2. */
function pulgadas(metros: number): string {
  let n = Math.round(((metros * MM_POR_M_DESINFECCION) / MM_POR_PULGADA) * DIECISEISAVOS)
  let q = DIECISEISAVOS
  while (n % 2 === 0 && q % 2 === 0) {
    n /= 2
    q /= 2
  }
  return q === 1 ? `${n}` : `${n}/${q}`
}

/** Cotas de la caseta: largo y ancho del cuadrado del mapa. */
export function construirCotasCaseta(d: DatosDesinfeccion): CotaCalculada[] {
  const L = d.caseta.largo.valor / 2
  const A = d.caseta.ancho.valor / 2
  const y = alturaCaseta(d)
  return [
    cotaEntre('largo', 'Largo = {valor} m', d.caseta.largo.valor, ejemplo(d.caseta.largo), [-L, y, A], [L, y, A], ARRIBA),
    cotaEntre('ancho', 'Ancho = {valor} m', d.caseta.ancho.valor, ejemplo(d.caseta.ancho), [L, y, -A], [L, y, A], [DESFASE_COTA_CANAL, DESFASE_COTA_CANAL, 0]),
  ]
}

/** Etiquetas de la caseta: tanque (3500 mg/L), bomba, línea y la dosis de solución según el caudal de la planta. */
export function construirEtiquetasCaseta(d: DatosDesinfeccion, caudalLs: number): EtiquetaCalculada[] {
  const F = DESFASES_ET_CASETA_CLORO
  const e = d.caseta.espesor.valor
  const tanque = posicionTanque(d)
  const bomba = posicionBomba(d)
  const c = d.cloracion
  const y = alturaCaseta(d)
  return [
    etiquetaDe('et-caseta', 'Caseta de cloración (hipoclorito, no cloro gas)', hayEjemplo([d.caseta.largo, d.caseta.alturaMuros]), [0, y, 0], F.caseta),
    etiquetaDe('et-tanque', `Hipoclorito: tanque de solución ${c.concentracion.valor} mg/L`, hayEjemplo([d.tanque.diametro, d.tanque.altura]), [tanque.x, e + d.tanque.altura.valor, tanque.z], F.tanque),
    etiquetaDe('et-bomba', 'Bomba dosificadora', hayEjemplo([d.bomba.largo, d.bomba.alto, d.bomba.ancho]), [bomba.x, e + d.bomba.alto.valor, bomba.z], F.bomba),
    etiquetaDe('et-linea', `Línea de cloro Ø ${pulgadas(c.diametroLinea.valor)}" al punto de aplicación`, false, [bomba.x, e + d.bomba.alto.valor / 2, d.caseta.ancho.valor / 2], F.linea),
    etiquetaDe('et-dosis', resolverTexto('Dosis de solución q = {valor} mL/s', caudalSolucion(d, caudalLs), false), false, [0, y, 0], F.dosis),
  ]
}
