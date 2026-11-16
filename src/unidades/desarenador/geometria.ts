import { ALTURA_BARANDA_CANAL, GROSOR_BARANDA_CANAL, OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { cajaEntre as caja } from '../comun/cajas'
import type { Agua, Pieza } from '../comun/tipos'
import { disponer, type DisposicionDesarenador } from './disposicion'
import type { DatosDesarenador } from './esquema'
import { alturaAgua } from './hidraulica'

/** Tolva, transición y vertedero Sutro de un canal centrado en z = zc. Cada pieza lleva el número del canal en su id. */
function piezasDeCanal(d: DatosDesarenador, s: DisposicionDesarenador, zc: number, k: number): Pieza[] {
  const e = d.canal.espesorMuro.valor
  const b = d.canal.ancho.valor
  const w = d.vertedero.ancho.valor
  const h = d.canal.alturaSalida.valor
  const t = d.tolva.altura.valor
  const a = d.vertedero.alturaMinima.valor
  const muro = { opacidad: OPACIDAD_CANAL }
  const fondo = { inclinacion: { pivote: [s.xVertedero, 0] as [number, number], angulo: s.inclinacionFondo } }
  const largoCanal = s.xVertedero - s.xCanal
  const largoPlaca = Math.hypot((b - w) / 2, t)
  const inclinacion = Math.atan2(t, (b - w) / 2)
  const placa = (lado: 1 | -1): Pieza => ({
    id: `placa-tolva-${k}-${lado === -1 ? 1 : 2}`,
    forma: 'caja',
    color: '--color-arena',
    pos: [s.xCanal + largoCanal / 2, t / 2, zc + (lado * (b + w)) / 4],
    tam: [largoCanal, e / 2, largoPlaca],
    giroX: -lado * inclinacion,
    ...fondo,
  })
  return [
    caja(`piso-transicion-${k}`, '--color-solado', [s.xInicio, s.xCanal], [0, t], [zc - b / 2, zc + b / 2], fondo),
    placa(-1),
    placa(1),
    caja(`cierre-tolva-${k}`, '--color-arena', [s.xVertedero - e / 2, s.xVertedero], [0, t], [zc - w / 2, zc + w / 2]),
    caja(`muro-vertedero-${k}-1`, '--color-muro', [s.xVertedero, s.xSalida], [0, h], [zc - b / 2, zc - w / 2], muro),
    caja(`muro-vertedero-${k}-2`, '--color-muro', [s.xVertedero, s.xSalida], [0, h], [zc + w / 2, zc + b / 2], muro),
    caja(`base-vertedero-${k}`, '--color-salida', [s.xVertedero, s.xSalida], [0, t + a], [zc - w / 2, zc + w / 2]),
  ]
}

/** Estructura: losa, muros laterales y central, y por cada canal su tolva de arena y su vertedero Sutro. Origen: centro del conjunto; y = 0 en el fondo de la tolva. */
export function construirPiezas(d: DatosDesarenador): Pieza[] {
  const s = disponer(d)
  const e = d.canal.espesorMuro.valor
  const ec = d.canal.espesorMuroCentral.valor
  const h = d.canal.alturaSalida.valor
  const muro = { opacidad: OPACIDAD_CANAL }
  const zLateral = s.semiancho - e / 2
  const g = GROSOR_BARANDA_CANAL
  const zBaranda: [number, number] = [s.semiancho - g, s.semiancho]
  const piezas: Pieza[] = [
    caja('losa', '--color-piso', [s.xInicio - e, s.xFin + e], [-d.canal.espesorLosa.valor, 0], [-s.semiancho, s.semiancho]),
    caja('muro-1', '--color-muro', [s.xInicio, s.xFin], [0, h], [-zLateral - e / 2, -zLateral + e / 2], muro),
    caja('muro-2', '--color-muro', [s.xInicio, s.xFin], [0, h], [zLateral - e / 2, zLateral + e / 2], muro),
    caja('muro-entrada', '--color-muro', [s.xInicio - e, s.xInicio], [0, h], [-s.semiancho, s.semiancho], muro),
  ]
  if (s.zCanales.length > 1) piezas.push(caja('muro-central', '--color-muro', [s.xInicio, s.xFin], [0, h], [-ec / 2, ec / 2], muro))
  s.zCanales.forEach((zc, i) => piezas.push(...piezasDeCanal(d, s, zc, i + 1)))
  piezas.push(
    caja('baranda-pasamanos', '--color-baranda', [s.xInicio, s.xFin], [h + ALTURA_BARANDA_CANAL - g, h + ALTURA_BARANDA_CANAL], zBaranda, { accesorio: true }),
    caja('baranda-poste-1', '--color-baranda', [s.xInicio, s.xInicio + g], [h, h + ALTURA_BARANDA_CANAL], zBaranda, { accesorio: true }),
    caja('baranda-poste-2', '--color-baranda', [s.xFin - g, s.xFin], [h, h + ALTURA_BARANDA_CANAL], zBaranda, { accesorio: true }),
  )
  return piezas
}

/** Agua de cada canal (le toca la mitad del caudal si son dos; el nivel sale de la fórmula del vertedero de la hoja): la lámina sobre el piso con la altura del vertedero Sutro, y la de la tolva (llena si hay caudal). */
export function construirAguas(d: DatosDesarenador, caudalLs: number): Agua[] {
  const s = disponer(d)
  const altura = alturaAgua(d, caudalLs / d.canal.numero.valor)
  if (altura <= 0) return []
  const t = d.tolva.altura.valor
  const largo = s.xVertedero - s.xInicio
  const largoCanal = s.xVertedero - s.xCanal
  const anchoTolva = (d.canal.ancho.valor + d.vertedero.ancho.valor) / 2
  return s.zCanales.flatMap((zc, i): Agua[] => [
    { forma: 'caja', id: `agua-canal-${i + 1}`, centro: [s.xInicio + largo / 2, zc], largo, ancho: d.canal.ancho.valor, y0: t, nivel: altura },
    { forma: 'caja', id: `agua-tolva-${i + 1}`, centro: [s.xCanal + largoCanal / 2, zc], largo: largoCanal, ancho: anchoTolva, y0: 0, nivel: t, inclinacion: { pivote: [s.xVertedero, 0], angulo: s.inclinacionFondo } },
  ])
}
