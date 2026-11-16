import { DESFASE_COTA_CANAL } from '../../nucleo/constantesCanales'
import { DESFASES_ET_PERCOLADOR, MM_POR_M_PERCOLADOR, SEPARACION_PUNTA_BRAZOS_PERCOLADOR, SEPARACION_PUNTA_ENTRADA_PERCOLADOR, SEPARACION_PUNTA_LAMINA_PERCOLADOR } from '../../nucleo/constantesPercolador'
import { ARRIBA, cotaEntre, etiquetaDe } from '../comun/anotar'
import { hayEjemplo } from '../comun/medidas'
import { resolverTexto } from '../comun/texto'
import type { CotaCalculada, EtiquetaCalculada, Vec3 } from '../comun/tiposAnotaciones'
import { disponer } from './disposicion'
import type { DatosPercolador } from './esquema'
import { cargaHidraulica, laminaLecho, volumenPlano } from './hidraulica'

const ejemplo = (m: { demo?: boolean }) => m.demo === true

/** Cotas del filtro: diámetro, muro, columna y las alturas de la losa, la cámara de ventilación y el lecho; y las de la cámara de salida. */
export function construirCotas(d: DatosPercolador): CotaCalculada[] {
  const s = disponer(d)
  const lado: Vec3 = [-DESFASE_COTA_CANAL, 0, 0]
  const sa = d.salida
  const zSalida = -sa.ancho.valor / 2
  const costado: Vec3 = [0, 0, -DESFASE_COTA_CANAL]
  return [
    cotaEntre('diametro', 'Diámetro interior = {valor} m', d.cuerpo.diametroInterior.valor, ejemplo(d.cuerpo.diametroInterior), [-s.radio, s.yLecho, 0], [s.radio, s.yLecho, 0], ARRIBA),
    cotaEntre('muro', 'Muro e = {valor} m', d.cuerpo.espesorMuro.valor, ejemplo(d.cuerpo.espesorMuro), [s.radio, s.yLecho, 0], [s.radioExterior, s.yLecho, 0], ARRIBA),
    cotaEntre('columna', 'Columna Ø {valor} m', d.distribuidor.diametroColumna.valor, ejemplo(d.distribuidor.diametroColumna), [-s.radioColumna, s.yColumna, 0], [s.radioColumna, s.yColumna, 0], ARRIBA),
    cotaEntre('losa', 'Losa e = {valor} m', d.cuerpo.espesorLosa.valor, ejemplo(d.cuerpo.espesorLosa), [-s.radioExterior, 0, 0], [-s.radioExterior, s.yLosa, 0], lado),
    cotaEntre('camara', 'Cámara de ventilación = {valor} m', d.camaraInferior.altura.valor, ejemplo(d.camaraInferior.altura), [-s.radioExterior, s.yLosa, 0], [-s.radioExterior, s.yCamara, 0], lado),
    cotaEntre('lecho', 'Lecho de roca = {valor} m', d.lecho.altura.valor, ejemplo(d.lecho.altura), [-s.radioExterior, s.yCamara, 0], [-s.radioExterior, s.yLecho, 0], lado),
    cotaEntre('salida-ancho', 'Cámara de salida = {valor} m', sa.ancho.valor, ejemplo(sa.ancho), [s.xSalida, sa.profundidad.valor, zSalida], [s.xSalida + sa.ancho.valor, sa.profundidad.valor, zSalida], costado),
    cotaEntre('salida-profundidad', 'Profundidad = {valor} m', sa.profundidad.valor, ejemplo(sa.profundidad), [s.xSalida + sa.ancho.valor, 0, zSalida], [s.xSalida + sa.ancho.valor, sa.profundidad.valor, zSalida], costado),
  ]
}

/** Diámetro nominal DN (mm) de una tubería dada en metros. */
const dn = (metros: number) => Math.round(metros * MM_POR_M_PERCOLADOR)
const dentro = (e: EtiquetaCalculada): EtiquetaCalculada => ({ ...e, interior: true })

/** Etiquetas de las partes, el tiempo de contacto, la carga hidráulica y los dos volúmenes (hoja y plano, aparte). */
export function construirEtiquetas(d: DatosPercolador, caudalLs: number, caudalMaximoLs: number, contactoMin: number, contactoEjemplo: boolean): EtiquetaCalculada[] {
  const s = disponer(d)
  const F = DESFASES_ET_PERCOLADOR
  const sa = d.salida
  const c = d.camaraInferior
  const lamina = laminaLecho(d, caudalLs, caudalMaximoLs)
  const dist = d.distribuidor
  return [
    etiquetaDe('et-muro', 'Muro perimetral de concreto', false, [s.radioExterior, s.yLecho, 0], F.muro),
    dentro(etiquetaDe('et-lecho', 'Lecho de roca', false, [s.radio / 2, s.yCamara + d.lecho.altura.valor / 2, 0], F.lecho)),
    dentro(etiquetaDe('et-columna', 'Columna central con motor', ejemplo(dist.alturaColumnaSobreLecho), [0, s.yColumna, 0], F.columna)),
    etiquetaDe('et-brazos', `Distribuidor rotatorio (${dist.cantidadBrazos.valor} brazos DN ${dn(dist.diametroBrazo.valor)})`, hayEjemplo([dist.vueltasPorMinuto, dist.alturaBrazoSobreLecho]), [s.radioColumna + SEPARACION_PUNTA_BRAZOS_PERCOLADOR, s.yBrazo, 0], F.brazos),
    etiquetaDe('et-entrada', `Entrada DN ${dn(d.entrada.diametro.valor)} ${d.entrada.material.valor} desde el RAFA (enterrada)`, false, [-s.radioExterior - SEPARACION_PUNTA_ENTRADA_PERCOLADOR, -d.entrada.diametro.valor / 2, 0], F.entrada),
    etiquetaDe('et-ventanas', resolverTexto('Ventanas de ventilación {valor} × {valor}', c.ladoVentana.valor, false), hayEjemplo([c.cantidadVentanas, c.alturaVentanaSobreLosa]), [0, s.yLosa + c.alturaVentanaSobreLosa.valor, s.radioExterior], F.ventanas),
    dentro(etiquetaDe('et-canal', 'Canal central de recolección', hayEjemplo([d.canal.ancho, d.canal.alto]), [0, s.yLosa, 0], F.canal)),
    etiquetaDe('et-salida', 'Cámara de salida', false, [s.xSalida + sa.ancho.valor / 2, sa.profundidad.valor, 0], F.salida),
    etiquetaDe('et-compuerta', resolverTexto('Compuerta mural {valor} × {valor}', sa.ladoCompuerta.valor, false), false, [s.xSalida, s.yLosa + sa.ladoCompuerta.valor / 2, 0], F.compuerta),
    etiquetaDe('et-contacto', `Tiempo de contacto = ${contactoMin} min`, contactoEjemplo, [0, s.yLecho, 0], F.contacto),
    etiquetaDe('et-carga', resolverTexto('Carga hidráulica = {valor} m³/m²·d', cargaHidraulica(d, caudalLs), false), false, [0, s.yLecho, 0], F.carga),
    etiquetaDe('et-volumen-hoja', resolverTexto('Volumen (hoja) = {valor} m³', d.hidraulica.volumenHoja.valor, false), false, [0, s.yLecho, 0], F.volumenHoja),
    etiquetaDe('et-volumen-plano', resolverTexto('Volumen (plano) = {valor} m³', volumenPlano(d), false), false, [0, s.yLecho, 0], F.volumenPlano),
    etiquetaDe('et-lamina', resolverTexto('Lámina sobre el lecho = {valor} m', lamina, false), ejemplo(d.agua.laminaMaxima), [s.radio - SEPARACION_PUNTA_LAMINA_PERCOLADOR, s.yLecho + lamina, 0], F.lamina),
  ]
}
