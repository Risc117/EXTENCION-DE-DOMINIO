import { DESFASE_COTA_CANAL } from '../../nucleo/constantesCanales'
import { CM_POR_M_LECHOS, DESFASES_ET_LECHOS, MM_POR_M_LECHOS } from '../../nucleo/constantesLechos'
import { MM_POR_PULGADA } from '../../nucleo/constantesDesinfeccion'
import { ARRIBA, cotaEntre, etiquetaDe } from '../comun/anotar'
import { hayEjemplo } from '../comun/medidas'
import { resolverTexto } from '../comun/texto'
import type { CotaCalculada, EtiquetaCalculada, Vec3 } from '../comun/tiposAnotaciones'
import { disponer } from './disposicion'
import type { DatosLechos } from './esquema'
import { areaPlano, mitadAncho } from './hidraulica'

const ejemplo = (m: { demo?: boolean }) => m.demo === true
const cm = (m: number) => Math.round(m * CM_POR_M_LECHOS)
const metros = (m: number) => m.toFixed(2)

/** Cotas del primer lecho: ancho y largo interiores, muro, dren, mitad, profundidad h y altura del muro sobre el terreno. */
export function construirCotas(d: DatosLechos): CotaCalculada[] {
  const s = disponer(d)
  const cx = s.centro(1)
  const lado: Vec3 = [DESFASE_COTA_CANAL, 0, DESFASE_COTA_CANAL]
  const y = s.yMuro
  return [
    cotaEntre('ancho', 'Ancho interior = {valor} m', d.lecho.anchoInterior.valor, ejemplo(d.lecho.anchoInterior), [cx - s.mitadX, y, s.mitadZ], [cx + s.mitadX, y, s.mitadZ], ARRIBA),
    cotaEntre('largo', 'Largo interior = {valor} m', d.lecho.largoInterior.valor, ejemplo(d.lecho.largoInterior), [cx + s.mitadX, y, -s.mitadZ], [cx + s.mitadX, y, s.mitadZ], [DESFASE_COTA_CANAL, DESFASE_COTA_CANAL, 0]),
    cotaEntre('muro', 'Muro e = {valor} m', d.muro.espesor.valor, ejemplo(d.muro.espesor), [cx + s.mitadX, y, -s.mitadZ], [cx + s.mitadX + s.muro, y, -s.mitadZ], ARRIBA),
    cotaEntre('dren', 'Dren central = {valor} m', d.dren.ancho.valor, ejemplo(d.dren.ancho), [cx - s.xDren, y, s.mitadZ], [cx + s.xDren, y, s.mitadZ], ARRIBA),
    cotaEntre('mitad', 'Cada lado del dren = {valor} m', mitadAncho(d), ejemplo(d.lecho.anchoInterior), [cx + s.xDren, y, -s.mitadZ], [cx + s.mitadX, y, -s.mitadZ], ARRIBA),
    cotaEntre('profundidad', 'Profundidad h = {valor} m', d.hoja.profundidad.valor, ejemplo(d.hoja.profundidad), [cx + s.mitadX + s.muro, 0, s.mitadZ + s.muro], [cx + s.mitadX + s.muro, s.yCapas, s.mitadZ + s.muro], lado),
    cotaEntre('sobre-terreno', 'Muro sobre el terreno = {valor} m', d.muro.alturaSobreTerreno.valor, ejemplo(d.muro.alturaSobreTerreno), [cx + s.mitadX + s.muro, s.yCapas, s.mitadZ + s.muro], [cx + s.mitadX + s.muro, s.yMuro, s.mitadZ + s.muro], lado),
  ]
}

const granulo = (c: { granuloMin: { valor: number }; granuloMax: { valor: number } }) => `${c.granuloMin.valor} – ${c.granuloMax.valor} mm`

/** Etiquetas de las partes y las capas, el lodo (de ejemplo), el ciclo de la hoja, las dos áreas y la cantidad de lechos (por confirmar). */
export function construirEtiquetas(d: DatosLechos, nivelLodo: number): EtiquetaCalculada[] {
  const s = disponer(d)
  const F = DESFASES_ET_LECHOS
  const cx = s.centro(1)
  const c = d.capas
  const lad = c.ladrillo
  const xCapa = cx + (s.xDren + s.mitadX) / 2
  const capa = (id: string, nombre: string, y: [number, number], e: number, ej: boolean, rango = '') => etiquetaDe(id, `${nombre}${rango} · e = ${metros(e)} m`, ej, [xCapa, (y[0] + y[1]) / 2, -s.mitadZ], F[id.replace('et-', '')] ?? [2, 1, 3])
  const y1 = c.gravaGruesa.espesor.valor
  const y2 = y1 + c.gravaMedia.espesor.valor
  const y3 = y2 + c.gravaFina.espesor.valor
  const y4 = y3 + c.arena.espesor.valor
  const horas = d.lodo.horasPorCiclo.valor
  return [
    etiquetaDe('et-muros', 'Muros de concreto', ejemplo(d.muro.espesor), [cx - s.mitadX - s.muro, s.yMuro, 0], F.muros),
    etiquetaDe('et-dren', 'Dren central', ejemplo(d.dren.ancho), [cx, s.yCapas, 0], F.dren),
    etiquetaDe('et-tapas', resolverTexto('Tapas del dren cada {valor} m', d.dren.separacionTapas.valor, false), hayEjemplo([d.dren.separacionTapas, d.dren.ranura]), [cx, s.yCapas, s.mitadZ / 2], F.tapas),
    etiquetaDe('et-tubo', `Tubería perforada Ø ${Math.round((d.dren.diametroTuberia.valor * MM_POR_M_LECHOS) / MM_POR_PULGADA)}" en el fondo del dren`, false, [cx, -s.profundidadDren + d.dren.diametroTuberia.valor / 2, -s.mitadZ], F.tubo),
    etiquetaDe('et-piso', `Piso de concreto inclinado hacia el dren (${d.piso.pendiente.valor} %)`, ejemplo(d.piso.pendiente), [cx + s.mitadX, -s.pared / 2, s.mitadZ / 2], F.piso),
    capa('et-ladrillo', `Ladrillo adoquín ${cm(lad.ancho.valor)} × ${cm(lad.largo.valor)} × ${cm(lad.alto.valor)} cm`, [y4, s.yCapas], lad.espesor.valor, ejemplo(lad.espesor)),
    capa('et-arena', 'Arena', [y3, y4], c.arena.espesor.valor, ejemplo(c.arena.espesor), ` (${granulo(c.arena)})`),
    capa('et-gravaFina', 'Grava fina', [y2, y3], c.gravaFina.espesor.valor, ejemplo(c.gravaFina.espesor), ` (${granulo(c.gravaFina)})`),
    capa('et-gravaMedia', 'Grava media', [y1, y2], c.gravaMedia.espesor.valor, ejemplo(c.gravaMedia.espesor), ` (${granulo(c.gravaMedia)})`),
    capa('et-gravaGruesa', 'Grava gruesa', [0, y1], c.gravaGruesa.espesor.valor, ejemplo(c.gravaGruesa.espesor), ` (${granulo(c.gravaGruesa)})`),
    etiquetaDe('et-lodo', resolverTexto('Lodo = {valor} m', nivelLodo, false), true, [cx + (s.xDren + s.mitadX) / 2, s.yCapas + nivelLodo, 0], F.lodo),
    etiquetaDe('et-ciclo', `Ciclo de ${d.hoja.cicloDias.valor} días: ${d.hoja.secadoSemanas.valor} semanas de secado + ${d.hoja.remocionSemanas.valor} de remoción (en pantalla: ${horas} h simuladas)`, true, [cx, s.yMuro, 0], F.ciclo),
    etiquetaDe('et-area', `Área por lecho: plano ${metros(areaPlano(d))} m² · hoja ${metros(d.hoja.areaHoja.valor)} m²`, false, [cx, s.yMuro, 0], F.area),
    etiquetaDe('et-cantidad', `Lechos: ${s.n} (por confirmar con el usuario)`, ejemplo(d.lecho.cantidad), [cx, s.yMuro, 0], F.cantidad),
  ]
}
