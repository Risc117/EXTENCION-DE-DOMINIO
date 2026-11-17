import { DESFASE_COTA_CANAL } from '../../nucleo/constantesCanales'
import { DESFASES_ET_SEDIMENTADOR, MM_POR_M_SEDIMENTADOR, SEPARACION_PUNTA_SEDIMENTADOR } from '../../nucleo/constantesSedimentador'
import { ARRIBA, cotaEntre, etiquetaDe } from '../comun/anotar'
import { hayEjemplo } from '../comun/medidas'
import { resolverTexto } from '../comun/texto'
import type { CotaCalculada, EtiquetaCalculada, Vec3 } from '../comun/tiposAnotaciones'
import { disponer } from './disposicion'
import { direccionPuerto, INSTANCIA_PRIMERA, puertosDe } from './puertos'
import type { DatosSedimentador } from './esquema'
import { cargaVertedero, laminaCanal, muescas, retencion, volumenPlano } from './hidraulica'

const ejemplo = (m: { demo?: boolean }) => m.demo === true
const dn = (metros: number) => Math.round(metros * MM_POR_M_SEDIMENTADOR)
const horas = (h: number) => (Number.isFinite(h) ? h.toFixed(2) : 'sin caudal')
const dentro = (e: EtiquetaCalculada): EtiquetaCalculada => ({ ...e, interior: true })

/** Cotas: diámetros del tanque y del canal, muro, altura de agua, borde libre, tolva y cámara central. */
export function construirCotas(d: DatosSedimentador): CotaCalculada[] {
  const s = disponer(d)
  const t = d.tanque
  const lado: Vec3 = [-DESFASE_COTA_CANAL, 0, 0]
  const x = -s.radioCanalExterior
  return [
    cotaEntre('diametro', 'Diámetro interior = {valor} m', t.diametroInterior.valor, ejemplo(t.diametroInterior), [-s.radio, s.yTope, 0], [s.radio, s.yTope, 0], ARRIBA),
    cotaEntre('muro', 'Muro e = {valor} m', t.espesorMuro.valor, ejemplo(t.espesorMuro), [s.radio, s.yTope, 0], [s.radioMuro, s.yTope, 0], ARRIBA),
    cotaEntre('canal', 'Canal Ø = {valor} m', 2 * s.radioCanalInterior, ejemplo(d.canal.ancho), [0, s.yTope, -s.radioCanalInterior], [0, s.yTope, s.radioCanalInterior], ARRIBA),
    cotaEntre('exterior', 'Exterior Ø = {valor} m', 2 * s.radioCanalExterior, ejemplo(d.canal.ancho), [0, s.yTope, -s.radioCanalExterior], [0, s.yTope, s.radioCanalExterior], [0, 2 * DESFASE_COTA_CANAL, 0]),
    cotaEntre('agua', 'Altura de agua = {valor} m', t.alturaAgua.valor, ejemplo(t.alturaAgua), [x, s.yTolva, 0], [x, s.yAgua, 0], lado),
    cotaEntre('borde', 'Borde libre = {valor} m', t.bordoLibre.valor, ejemplo(t.bordoLibre), [x, s.yAgua, 0], [x, s.yTope, 0], lado),
    cotaEntre('tolva', 'Tolva = {valor} m', d.tolva.altura.valor, ejemplo(d.tolva.altura), [x, 0, 0], [x, s.yTolva, 0], lado),
    cotaEntre('camara', 'Cámara central Ø = {valor} m', d.camaraCentral.diametro.valor, ejemplo(d.camaraCentral.diametro), [0, s.yAgua, -d.camaraCentral.diametro.valor / 2], [0, s.yAgua, d.camaraCentral.diametro.valor / 2], ARRIBA),
  ]
}

/** Etiquetas de las partes, el caudal de la unidad (Q/2), la carga sobre el vertedero y los dos TR (hoja y plano, aparte). */
export function construirEtiquetas(d: DatosSedimentador, caudalUnidadLs: number, instancia = INSTANCIA_PRIMERA): EtiquetaCalculada[] {
  const s = disponer(d)
  const pu = puertosDe(d, instancia)
  /** Punto a `radio` m del centro en la dirección del puerto, a la altura `y`. */
  const sobre = (grados: number, radio: number, y: number): Vec3 => [radio * Math.cos(direccionPuerto(grados)), y, radio * Math.sin(direccionPuerto(grados))]
  const F = DESFASES_ET_SEDIMENTADOR
  const a = d.accesorios
  const cc = d.camaraCentral
  const yCamara = s.yAgua - cc.altura.valor
  const p = SEPARACION_PUNTA_SEDIMENTADOR
  const trHoja = retencion(d.hidraulica.volumenHoja.valor, caudalUnidadLs)
  const trPlano = retencion(volumenPlano(d), caudalUnidadLs)
  return [
    etiquetaDe('et-muro', 'Muro de concreto', false, [s.radioMuro, s.yAgua, 0], F.muro),
    etiquetaDe('et-tolva', `Tolva cónica ${d.tolva.angulo.valor}°`, false, [s.radio / 2, s.yTolva / 2, 0], F.tolva),
    etiquetaDe('et-canal', 'Canal perimetral de recolección', ejemplo(d.canal.profundidad), [-(s.radioMuro + s.radioCanalInterior) / 2, s.yCanalFondo + p, 0], F.canal),
    etiquetaDe('et-vertedero', `Vertedero triangular ${d.vertedero.anguloMuesca.valor}° (${muescas(d)} muescas)`, ejemplo(d.vertedero.espesorPlaca), [0, s.yAgua, -s.radio], F.vertedero),
    dentro(etiquetaDe('et-camara-central', 'Cámara central', false, [cc.diametro.valor / 2, s.yAgua - cc.altura.valor / 2, 0], F.camaraCentral)),
    dentro(etiquetaDe('et-deflector', 'Deflector', ejemplo(cc.diametroDeflector), [cc.diametroDeflector.valor / 2, yCamara, 0], F.deflector)),
    dentro(etiquetaDe('et-alimentacion', `Alimentación DN ${dn(d.tuberias.diametroEntrada.valor)} desde el percolador`, false, [0, yCamara / 2, 0], F.alimentacion)),
    etiquetaDe('et-purga', `Purga de lodos DN ${dn(d.tuberias.diametroPurga.valor)} (hidráulica)`, false, sobre(pu.purga.valor, s.radioCanalExterior, -d.tuberias.diametroPurga.valor / 2), F.purga),
    etiquetaDe('et-salida', `Salida DN ${dn(d.tuberias.diametroSalida.valor)} a desinfección`, false, sobre(pu.salida.valor, s.radioCanalExterior, s.yCanalFondo + p), F.salida),
    etiquetaDe('et-puente', 'Puente barrendero', hayEjemplo([a.anchoPuente, a.altoPuente, a.vueltasPorMinuto]), [-s.radio / 2, s.yTope + a.altoPuente.valor, 0], F.puente),
    etiquetaDe('et-pasarela', 'Pasarela de acceso', ejemplo(a.anchoPasarela), [s.radioMuro, s.yTope + a.altoPuente.valor, 0], F.pasarela),
    etiquetaDe('et-mampara', 'Mampara de natas', hayEjemplo([a.alturaMampara, a.separacionMampara]), [s.radio - a.separacionMampara.valor, s.yAgua, 0], F.mampara),
    etiquetaDe('et-escalera', 'Escalera marinera', hayEjemplo([a.alturaEscalera, a.anchoEscalera]), [s.radioCanalExterior, s.yTope, 0], F.escalera),
    dentro(etiquetaDe('et-lodo', 'Manto de lodos', ejemplo(d.tolva.alturaLodo), [0, d.tolva.alturaLodo.valor, 0], F.lodo)),
    etiquetaDe('et-caudal', resolverTexto('Caudal por unidad = {valor} L/s', caudalUnidadLs, false), false, [0, s.yTope, 0], F.caudal),
    etiquetaDe('et-tr-hoja', `TR (hoja) = ${horas(trHoja)} h`, false, [0, s.yTope, 0], F.trHoja),
    etiquetaDe('et-tr-plano', `TR (plano) = ${horas(trPlano)} h`, false, [0, s.yTope, 0], F.trPlano),
    etiquetaDe('et-carga', resolverTexto('Carga sobre el vertedero = {valor} m³/m·d', cargaVertedero(d, caudalUnidadLs), false), false, [0, s.yTope, 0], F.carga),
    etiquetaDe('et-lamina', resolverTexto('Lámina en el canal = {valor} m', laminaCanal(d, caudalUnidadLs), false), false, [s.radioCanalInterior, s.yCanalFondo + d.tanque.espesorMuro.valor, 0], F.lamina),
  ]
}
