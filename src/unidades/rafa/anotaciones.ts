import { DESFASE_COTA_CANAL } from '../../nucleo/constantesCanales'
import { ALTURA_PUNTA_DESCARGA_RAFA, ALTURA_PUNTA_DIGESTOR_RAFA, ALTURA_PUNTA_MUESTREO_RAFA, ALTURA_PUNTA_ZONA_RAFA, CORRIMIENTO_TR_PLANO_RAFA, DESFASES_ET_RAFA, MARGEN_PUNTA_NIVEL_RAFA, SEPARACION_PUNTA_CAJAS_RAFA } from '../../nucleo/constantesRafa'
import { hayEjemplo } from '../comun/medidas'
import { ARRIBA, cotaEntre, etiquetaDe } from '../comun/anotar'
import { resolverTexto } from '../comun/texto'
import type { CotaCalculada, EtiquetaCalculada, Vec3 } from '../comun/tiposAnotaciones'
import { disponer } from './disposicion'
import type { DatosRafa } from './esquema'
import { xTomas } from './internos'

const ejemplo = (m: { demo?: boolean }) => m.demo === true

/** Cotas del RAFA: largo y ancho exteriores, espesor del muro, altura interior, digestor y zona de sedimentación. */
export function construirCotas(d: DatosRafa): CotaCalculada[] {
  const s = disponer(d)
  const c = d.cuerpo
  const lado: Vec3 = [DESFASE_COTA_CANAL, 0, -DESFASE_COTA_CANAL]
  const yDigestor = s.yPiso + c.alturaDigestor.valor
  return [
    cotaEntre('largo', 'Largo exterior = {valor} m', c.largoExterior.valor, ejemplo(c.largoExterior), [-s.semiLargo, s.yLosa, s.semiAncho], [s.semiLargo, s.yLosa, s.semiAncho], ARRIBA),
    cotaEntre('ancho', 'Ancho exterior = {valor} m', c.anchoExterior.valor, ejemplo(c.anchoExterior), [s.semiLargo, s.yLosa, -s.semiAncho], [s.semiLargo, s.yLosa, s.semiAncho], ARRIBA),
    cotaEntre('muro', 'Muro e = {valor} m', c.espesorMuro.valor, ejemplo(c.espesorMuro), [s.semiLargoInterior, s.yLosa, s.semiAncho], [s.semiLargo, s.yLosa, s.semiAncho], ARRIBA),
    cotaEntre('interior', 'Altura interior = {valor} m', s.alturaInterior, ejemplo(c.alturaLaminaAgua), [s.semiLargo, s.yPiso, -s.semiAncho], [s.semiLargo, s.yMuros, -s.semiAncho], lado),
    cotaEntre('digestor', 'Digestor = {valor} m', c.alturaDigestor.valor, ejemplo(c.alturaDigestor), [-s.semiLargo, s.yPiso, -s.semiAncho], [-s.semiLargo, yDigestor, -s.semiAncho], [-DESFASE_COTA_CANAL, 0, -DESFASE_COTA_CANAL]),
    cotaEntre('sedimentacion', 'Sedimentación = {valor} m', c.alturaSedimentacion.valor, ejemplo(c.alturaSedimentacion), [-s.semiLargo, yDigestor, -s.semiAncho], [-s.semiLargo, yDigestor + c.alturaSedimentacion.valor, -s.semiAncho], [-DESFASE_COTA_CANAL, 0, -DESFASE_COTA_CANAL]),
  ]
}

const dentro = (e: EtiquetaCalculada): EtiquetaCalculada => ({ ...e, interior: true })
const horas = (h: number) => (Number.isFinite(h) ? h.toFixed(1) : 'sin caudal')

/** Etiquetas de las partes del RAFA, el nivel del agua y los dos tiempos de retención (hoja y plano, aparte). */
export function construirEtiquetas(d: DatosRafa, nivel: number, trHoja: number, trPlano: number): EtiquetaCalculada[] {
  const s = disponer(d)
  const yBase = s.yPiso + d.cuerpo.alturaDigestor.valor
  const x = xTomas(d)
  const x0 = s.xModulos[0]
  const F = DESFASES_ET_RAFA
  const caja = d.distribucion.caja
  const ef = d.efluente
  const zFuera = s.semiAncho + SEPARACION_PUNTA_CAJAS_RAFA
  const nivelTexto = resolverTexto('Nivel de agua = {valor} m', nivel, true)
  return [
    etiquetaDe('et-caja-distribucion', 'Caja de distribución', false, [0, s.yLosa + caja.alto.valor, -s.semiAncho - caja.ancho.valor / 2], F.cajaDistribucion),
    dentro(etiquetaDe('et-colector', `Colector de distribución (${d.distribucion.ramalesColector.valor} ramales)`, hayEjemplo(Object.values(d.distribucion.colector)), [0, s.yPiso + d.distribucion.colector.alturaSobrePiso.valor, 0], F.colector)),
    dentro(etiquetaDe('et-sedimentacion', 'Zona de sedimentación: campanas y deflectores', false, [x0, yBase + ALTURA_PUNTA_ZONA_RAFA, s.zFilas[0]], F.sedimentacion)),
    dentro(etiquetaDe('et-digestor', 'Digestor (manto de lodos)', false, [x, s.yPiso + ALTURA_PUNTA_DIGESTOR_RAFA, 0], F.digestor)),
    dentro(etiquetaDe('et-gases', 'Zona de gases', false, [0, yBase + ALTURA_PUNTA_ZONA_RAFA, 0], F.gases)),
    etiquetaDe('et-efluente', 'Cámara de efluente con rejilla', hayEjemplo([ef.espesorRejilla, ef.recoleccionSuperior, ef.recoleccionInferior]), [0, s.yMuros - ef.recoleccionSuperior.valor, s.semiAncho + ef.anchoCamara.valor], F.efluente),
    etiquetaDe('et-tomas', 'Tomas de muestra de lodo', ejemplo(d.lodos.diametroToma), [x, s.yPiso + d.lodos.alturasToma[0].valor, s.semiAncho], F.tomas),
    etiquetaDe('et-muestreo', 'Caja de muestreo', ejemplo(d.lodos.ladoCajaMuestreo), [x, s.yPiso + ALTURA_PUNTA_MUESTREO_RAFA, zFuera], F.muestreo),
    etiquetaDe('et-descarga', 'Caja de descarga de lodo', ejemplo(d.lodos.ladoCajaDescarga), [-x, s.yPiso + ALTURA_PUNTA_DESCARGA_RAFA, zFuera], F.descarga),
    { ...dentro(etiquetaDe('et-nivel', nivelTexto, false, [s.semiLargoInterior - MARGEN_PUNTA_NIVEL_RAFA, s.yPiso + nivel, 0], F.nivel)) },
    etiquetaDe('et-tr-hoja', `TR (hoja) = ${horas(trHoja)} h`, false, [0, s.yLosa, 0], F.trHoja),
    etiquetaDe('et-tr-plano', `TR (plano) = ${horas(trPlano)} h`, false, [CORRIMIENTO_TR_PLANO_RAFA, s.yLosa, 0], F.trPlano),
  ]
}
