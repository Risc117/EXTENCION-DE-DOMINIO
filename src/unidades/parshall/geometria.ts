import { ALTURA_BARANDA_CANAL, GROSOR_BARANDA_CANAL, OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { SEPARACION_REGLA_PARSHALL } from '../../nucleo/constantesCanales'
import { cajaEntre as caja } from '../comun/cajas'
import type { Agua, Pieza, PiezaCaja } from '../comun/tipos'
import { disponer } from './disposicion'
import type { DatosParshall } from './esquema'
import { cargaHo, profundidadGarganta } from './hidraulica'

/** Un muro inclinado (o recto) del lado `lado` (+1 o -1): su cara interior va de (xa, ±wa) a (xb, ±wb). */
function muro(id: string, lado: 1 | -1, xa: number, wa: number, xb: number, wb: number, e: number, h: number): PiezaCaja {
  const dx = xb - xa
  const dz = lado * (wb - wa)
  const largo = Math.hypot(dx, dz)
  const nx = (lado * -dz) / largo
  const nz = (lado * dx) / largo
  return {
    id,
    forma: 'caja',
    color: '--color-muro',
    pos: [(xa + xb) / 2 + (nx * e) / 2, h / 2, (lado * (wa + wb)) / 2 + (nz * e) / 2],
    tam: [largo, h, e],
    giroY: -Math.atan2(dz, dx),
    opacidad: OPACIDAD_CANAL,
  }
}

/** Canaleta Parshall: losa, pisos con su desnivel, muros que se angostan y ensanchan, regla de medición y baranda. Origen: centro; y = 0 en el piso de la garganta. */
export function construirPiezas(d: DatosParshall): Pieza[] {
  const s = disponer(d)
  const e = d.estructura.espesorMuro.valor
  const h = d.estructura.alturaMuro.valor
  const n = d.garganta.caida.valor
  const k = d.divergente.subida.valor
  const wa = s.anchoEntrada / 2
  const wg = s.anchoGarganta / 2
  const ws = s.anchoSalida / 2
  const piezas: Pieza[] = [
    caja('losa', '--color-piso', [s.xInicio - e, s.xFin + e], [-d.estructura.espesorLosa.valor, 0], [-s.semiancho, s.semiancho]),
    caja('piso-entrada', '--color-solado', [s.xInicio, s.xGarganta], [0, n], [-wa, wa]),
    caja('piso-salida', '--color-solado', [s.xSalida, s.xFin], [0, k], [-ws, ws]),
    {
      id: 'piso-divergente',
      forma: 'caja',
      color: '--color-solado',
      pos: [(s.xDivergente + s.xSalida) / 2, k / 2 - GROSOR_BARANDA_CANAL / 2, 0],
      tam: [Math.hypot(d.divergente.largo.valor, k), GROSOR_BARANDA_CANAL, 2 * ws],
      giroZ: Math.atan2(k, d.divergente.largo.valor),
    },
  ]
  for (const lado of [1, -1] as const) {
    const t = lado === 1 ? 'a' : 'b'
    piezas.push(
      muro(`muro-entrada-${t}`, lado, s.xInicio, wa, s.xConvergente, wa, e, h),
      muro(`muro-convergente-${t}`, lado, s.xConvergente, wa, s.xGarganta, wg, e, h),
      muro(`muro-garganta-${t}`, lado, s.xGarganta, wg, s.xDivergente, wg, e, h),
      muro(`muro-divergente-${t}`, lado, s.xDivergente, wg, s.xSalida, ws, e, h),
      muro(`muro-salida-${t}`, lado, s.xSalida, ws, s.xFin, ws, e, h),
    )
  }
  const g = GROSOR_BARANDA_CANAL
  const zBaranda: [number, number] = [s.semiancho - g, s.semiancho]
  piezas.push(
    caja('regla-medicion', '--color-valvula', [s.xMedicion - g / 2, s.xMedicion + g / 2], [n, n + d.convergente.alturaMuro.valor], [-wa + SEPARACION_REGLA_PARSHALL, -wa + SEPARACION_REGLA_PARSHALL + g], { accesorio: true }),
    caja('baranda-pasamanos', '--color-baranda', [s.xInicio, s.xFin], [h + ALTURA_BARANDA_CANAL - g, h + ALTURA_BARANDA_CANAL], zBaranda, { accesorio: true }),
    caja('baranda-poste-1', '--color-baranda', [s.xInicio, s.xInicio + g], [h, h + ALTURA_BARANDA_CANAL], zBaranda, { accesorio: true }),
    caja('baranda-poste-2', '--color-baranda', [s.xFin - g, s.xFin], [h, h + ALTURA_BARANDA_CANAL], zBaranda, { accesorio: true }),
  )
  return piezas
}

/** Agua: en la entrada y la sección convergente con la carga Ho de la hoja; en la garganta y después con la profundidad crítica. */
export function construirAguas(d: DatosParshall, caudalLs: number): Agua[] {
  const s = disponer(d)
  const ho = Math.min(cargaHo(d, caudalLs), d.convergente.alturaMuro.valor)
  const hg = Math.min(profundidadGarganta(d, caudalLs), d.convergente.alturaMuro.valor)
  if (ho <= 0) return []
  const n = d.garganta.caida.valor
  const k = d.divergente.subida.valor
  const centro = (a: number, b: number): [number, number] => [(a + b) / 2, 0]
  return [
    { forma: 'caja', id: 'agua-entrada', centro: centro(s.xInicio, s.xConvergente), largo: s.xConvergente - s.xInicio, ancho: s.anchoEntrada, y0: n, nivel: ho },
    { forma: 'cuna', id: 'agua-convergente', x0: s.xConvergente, x1: s.xGarganta, ancho0: s.anchoEntrada, ancho1: s.anchoGarganta, y0: n, nivel: ho },
    { forma: 'caja', id: 'agua-garganta', centro: centro(s.xGarganta, s.xDivergente), largo: s.xDivergente - s.xGarganta, ancho: s.anchoGarganta, y0: 0, nivel: hg },
    { forma: 'cuna', id: 'agua-divergente', x0: s.xDivergente, x1: s.xSalida, ancho0: s.anchoGarganta, ancho1: s.anchoSalida, y0: 0, nivel: hg },
    { forma: 'caja', id: 'agua-salida', centro: centro(s.xSalida, s.xFin), largo: s.xFin - s.xSalida, ancho: s.anchoSalida, y0: k, nivel: hg },
  ]
}
