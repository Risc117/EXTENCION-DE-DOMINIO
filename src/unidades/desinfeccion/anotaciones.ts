import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import { DESFASE_COTA_CANAL } from '../../nucleo/constantesCanales'
import { DESFASES_ET_CONTACTO, MM_POR_M_DESINFECCION } from '../../nucleo/constantesDesinfeccion'
import { ARRIBA, cotaEntre, etiquetaDe } from '../comun/anotar'
import { hayEjemplo } from '../comun/medidas'
import { resolverTexto } from '../comun/texto'
import type { CotaCalculada, EtiquetaCalculada, Vec3 } from '../comun/tiposAnotaciones'
import { disponer } from './disposicion'
import type { DatosDesinfeccion } from './esquema'
import { xAplicacion } from './geometria'
import { nivelAgua, paso, retencionMin, volumenPlano } from './hidraulica'

const ejemplo = (m: { demo?: boolean }) => m.demo === true
const minutos = (m: number) => (Number.isFinite(m) ? m.toFixed(2) : 'sin caudal')

/** Cotas: ancho y largo del plano, largo útil, canal, tabique, paso, muro, profundidad de agua y borde libre. */
export function construirCotas(d: DatosDesinfeccion): CotaCalculada[] {
  const s = disponer(d)
  const lado: Vec3 = [DESFASE_COTA_CANAL, 0, 0]
  const x = s.mitadLargo
  const y = s.yTope
  return [
    cotaEntre('ancho', 'Ancho total = {valor} m', d.totalesPlano.ancho.valor, ejemplo(d.totalesPlano.ancho), [x, y, -s.mitadAncho], [x, y, s.mitadAncho], ARRIBA),
    cotaEntre('largo', 'Largo total = {valor} m', d.totalesPlano.largo.valor, ejemplo(d.totalesPlano.largo), [-x, y, s.mitadAncho], [x, y, s.mitadAncho], [0, DESFASE_COTA_CANAL, DESFASE_COTA_CANAL]),
    cotaEntre('largo-util', 'Largo útil Lu = {valor} m', d.canales.largoInterior.valor, ejemplo(d.canales.largoInterior), [-s.mitadLargoInterior, y, s.mitadAnchoInterior], [s.mitadLargoInterior, y, s.mitadAnchoInterior], ARRIBA),
    cotaEntre('canal', 'Canal b = {valor} m', d.canales.ancho.valor, ejemplo(d.canales.ancho), [s.mitadLargoInterior, y, s.zCanal(1) - d.canales.ancho.valor / 2], [s.mitadLargoInterior, y, s.zCanal(1) + d.canales.ancho.valor / 2], ARRIBA),
    cotaEntre('tabique', 'Tabique e = {valor} m', d.tabique.espesor.valor, ejemplo(d.tabique.espesor), [-s.mitadLargoInterior, y, s.zTabique(2) - d.tabique.espesor.valor / 2], [-s.mitadLargoInterior, y, s.zTabique(2) + d.tabique.espesor.valor / 2], ARRIBA),
    cotaEntre('paso', 'Paso = {valor} m', paso(d), ejemplo(d.tabique.largo), [s.mitadLargoInterior - paso(d), y, s.zTabique(1)], [s.mitadLargoInterior, y, s.zTabique(1)], ARRIBA),
    cotaEntre('muro', 'Muro e = {valor} m', d.muro.espesor.valor, ejemplo(d.muro.espesor), [s.mitadLargoInterior, y, -s.mitadAncho], [s.mitadLargo, y, -s.mitadAncho], ARRIBA),
    cotaEntre('profundidad', 'Profundidad h = {valor} m', d.agua.profundidad.valor, ejemplo(d.agua.profundidad), [x, s.yLosa, s.mitadAncho], [x, s.yAgua, s.mitadAncho], lado),
    cotaEntre('borde', 'Borde libre = {valor} m', d.agua.bordeLibre.valor, ejemplo(d.agua.bordeLibre), [x, s.yAgua, s.mitadAncho], [x, s.yTope, s.mitadAncho], lado),
  ]
}

/** Etiquetas de las partes, los dos tiempos de contacto (hoja y plano, aparte) y el nivel de agua según el caudal. */
export function construirEtiquetas(d: DatosDesinfeccion, caudalLs: number): EtiquetaCalculada[] {
  const s = disponer(d)
  const F = DESFASES_ET_CONTACTO
  const c = d.cloracion
  const dn = Math.round(d.tuberias.diametro.valor * MM_POR_M_DESINFECCION)
  const xTubo = -s.mitadLargo - PROLONGACION_TUBO / 2
  const yEntrada = s.yLosa + d.tuberias.alturaEjeEntrada.valor
  const arriba: Vec3 = [0, s.yTope, 0]
  const trHoja = retencionMin(d.hidraulica.volumenHoja.valor, caudalLs)
  const trPlano = retencionMin(volumenPlano(d), caudalLs)
  return [
    etiquetaDe('et-muros', 'Muros de concreto', ejemplo(d.muro.espesor), [0, s.yTope, -s.mitadAncho], F.muros),
    etiquetaDe('et-losa', 'Losa de fondo', ejemplo(d.losa.espesor), [0, s.yLosa / 2, s.mitadAncho], F.losa),
    etiquetaDe('et-tabique', 'Tabique (mampara) con paso alterno', ejemplo(d.tabique.largo), [s.xTabique(1), s.yTope, s.zTabique(1)], F.tabique),
    etiquetaDe('et-pantalla', 'Pantalla (deflector) del paso 1-2', hayEjemplo([d.pantalla.espesor, d.pantalla.largo]), [s.xPaso(1), s.yAgua, s.zTabique(1)], F.pantalla),
    etiquetaDe('et-entrada', `Entrada PVC DN ${dn} desde los sedimentadores`, false, [xTubo, yEntrada, s.zCanal(1)], F.entrada),
    etiquetaDe('et-salida', `Salida PVC DN ${dn} de agua desinfectada`, false, [xTubo, s.yLosa + d.tuberias.alturaEjeSalida.valor, s.zCanal(4)], F.salida),
    etiquetaDe('et-aplicacion', 'Punto de aplicación del cloro (hipoclorito)', ejemplo(c.alturaPunto), [xAplicacion(d), yEntrada + c.alturaPunto.valor, s.zCanal(1)], F.aplicacion),
    etiquetaDe('et-mezclador', 'Mezclador estático', hayEjemplo([c.diametroMezclador, c.largoMezclador]), [xAplicacion(d) + c.largoMezclador.valor / 2, yEntrada, s.zCanal(1)], F.mezclador),
    etiquetaDe('et-retencion', 'Válvula de retención', ejemplo(c.largoValvula), [xAplicacion(d), yEntrada + c.alturaPunto.valor / 2, s.zCanal(1)], F.retencion),
    etiquetaDe('et-tr-hoja', `TR (hoja) = ${minutos(trHoja)} min`, false, arriba, F.trHoja),
    etiquetaDe('et-tr-plano', `TR (plano) = ${minutos(trPlano)} min`, false, arriba, F.trPlano),
    etiquetaDe('et-nivel', resolverTexto('Nivel de agua = {valor} m', nivelAgua(d, caudalLs), false), false, arriba, F.nivel),
  ]
}
