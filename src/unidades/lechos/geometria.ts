import { OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { cajaEntre as caja } from '../comun/cajas'
import type { Pieza } from '../comun/tipos'
import { disponer, type DisposicionLechos } from './disposicion'
import type { DatosLechos } from './esquema'

/** Capas de abajo hacia arriba: nombre en el JSON y color (tokens.css). */
const CAPAS = [
  { id: 'gravaGruesa', color: '--color-grava-gruesa' },
  { id: 'gravaMedia', color: '--color-grava-media' },
  { id: 'gravaFina', color: '--color-grava-fina' },
  { id: 'arena', color: '--color-arena' },
  { id: 'ladrillo', color: '--color-ladrillo' },
] as const

type IdCapa = (typeof CAPAS)[number]['id']

/** Una mitad del lecho (a cada lado del dren): capas, piso y lodo siguen la pendiente hacia el dren. lado = 1 (+x) o -1 (−x). */
function mitad(d: DatosLechos, s: DisposicionLechos, i: number, lado: 1 | -1, nivelLodo: number): Pieza[] {
  const cx = s.centro(i)
  const nombre = lado === 1 ? 'der' : 'izq'
  const x0 = cx + lado * s.xDren
  const x1 = cx + lado * s.mitadX
  const rango: [number, number] = lado === 1 ? [x0, x1] : [x1, x0]
  const inclinacion = { pivote: [x0, 0] as [number, number], angulo: lado * s.angulo }
  const pieza = (id: string, color: string, y: [number, number], extra = {}) => caja(id, color, rango, y, [-s.mitadZ, s.mitadZ], { inclinacion, ...extra })
  let y = 0
  const piezas: Pieza[] = [pieza(`piso-${i}-${nombre}`, '--color-solado', [-s.pared, 0])]
  for (const capa of CAPAS) {
    const e = d.capas[capa.id as IdCapa].espesor.valor
    piezas.push(pieza(`capa-${i}-${capa.id}-${nombre}`, capa.color, [y, y + e]))
    y += e
  }
  if (nivelLodo > 0) piezas.push(pieza(`lodo-${i}-${nombre}`, '--color-lodo', [s.yCapas, s.yCapas + nivelLodo]))
  return piezas
}

/** Dren central: piso, dos paredes, tubería perforada en el fondo y las tapas (accesorio) cada `separacionTapas`. */
function dren(d: DatosLechos, s: DisposicionLechos, i: number): Pieza[] {
  const cx = s.centro(i)
  const fondo = -s.profundidadDren
  const tapa = d.dren.espesorTapa.valor
  const paso = d.dren.separacionTapas.valor
  const cuantas = Math.floor((2 * s.mitadZ) / paso)
  const radio = d.dren.diametroTuberia.valor / 2
  const piezas: Pieza[] = [
    caja(`piso-dren-${i}`, '--color-solado', [cx - s.xDren + s.pared, cx + s.xDren - s.pared], [fondo - s.pared, fondo], [-s.mitadZ, s.mitadZ]),
    caja(`pared-dren-${i}-izq`, '--color-muro', [cx - s.xDren, cx - s.xDren + s.pared], [fondo - s.pared, s.yCapas], [-s.mitadZ, s.mitadZ]),
    caja(`pared-dren-${i}-der`, '--color-muro', [cx + s.xDren - s.pared, cx + s.xDren], [fondo - s.pared, s.yCapas], [-s.mitadZ, s.mitadZ]),
    { id: `tubo-dren-${i}`, forma: 'cilindro', color: '--color-impulsion', pos: [cx, fondo + radio, 0], radio, alto: 2 * s.mitadZ, eje: 'z' },
  ]
  for (let k = 1; k <= cuantas; k++) {
    const z = -s.mitadZ + (k - 0.5) * paso
    piezas.push(caja(`tapa-${i}-${k}`, '--color-losa', [cx - s.xDren, cx + s.xDren], [s.yCapas - tapa, s.yCapas], [z - (paso - d.dren.ranura.valor) / 2, z + (paso - d.dren.ranura.valor) / 2], { accesorio: true }))
  }
  return piezas
}

/** Muro perimetral de concreto de un lecho (translúcido con "Ver corte"). */
function muros(s: DisposicionLechos, i: number, corte: boolean): Pieza[] {
  const cx = s.centro(i)
  const extra = corte ? { opacidad: OPACIDAD_CANAL } : {}
  const y: [number, number] = [-s.pared, s.yMuro]
  const X = s.mitadX + s.muro
  const Z = s.mitadZ + s.muro
  return [
    caja(`muro-${i}-a`, '--color-muro', [cx - X, cx - s.mitadX], y, [-Z, Z], extra),
    caja(`muro-${i}-b`, '--color-muro', [cx + s.mitadX, cx + X], y, [-Z, Z], extra),
    caja(`muro-${i}-c`, '--color-muro', [cx - s.mitadX, cx + s.mitadX], y, [-Z, -s.mitadZ], extra),
    caja(`muro-${i}-d`, '--color-muro', [cx - s.mitadX, cx + s.mitadX], y, [s.mitadZ, Z], extra),
  ]
}

/** Lecho(s) de secado armados desde datos/lechos.json; `nivelLodo` (m) es el lodo sobre el ladrillo. */
export function construirPiezas(d: DatosLechos, corte = false, nivelLodo = 0): Pieza[] {
  const s = disponer(d)
  const camas = Array.from({ length: s.n }, (_, k) => k + 1)
  return camas.flatMap((i) => [...muros(s, i, corte), ...mitad(d, s, i, 1, nivelLodo), ...mitad(d, s, i, -1, nivelLodo), ...dren(d, s, i)])
}
