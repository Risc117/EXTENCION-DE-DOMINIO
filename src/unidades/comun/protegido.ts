import crudo from '../../../datos/conexiones.json'
import { planta } from '../planta'

type Segmento = { a: { x: number; y: number }; b: { x: number; y: number }; radio: number }

const segmentos: Segmento[] = crudo.tramos.flatMap((t) =>
  t.trazado.slice(1).map((q, i) => ({ a: t.trazado[i], b: q, radio: t.diametro.valor / 2 })),
)
const buzones = crudo.puntos.filter((p) => p.tipo === 'buzon').map((p) => ({ x: p.x.valor, y: p.y.valor, radio: crudo.buzon.diametroExterior.valor / 2 }))
const unidades = planta.unidades.map((u) => ({ id: u.id, x: u.x.valor, y: u.y.valor, radio: u.radioExplanada.valor }))

/** Unidades hidráulicas (su centro y el radio de su explanada) como zonas protegidas. */
export const zonasUnidades = unidades

function distanciaSegmento(x: number, y: number, s: Segmento): number {
  const [dx, dy] = [s.b.x - s.a.x, s.b.y - s.a.y]
  const largo2 = dx * dx + dy * dy
  const f = largo2 === 0 ? 0 : Math.min(1, Math.max(0, ((x - s.a.x) * dx + (y - s.a.y) * dy) / largo2))
  return Math.hypot(x - (s.a.x + dx * f), y - (s.a.y + dy * f))
}

/** Distancia (m) de (x, y) a lo hidráulico más cercano: la explanada de una unidad, el borde de una tubería o de un buzón. 0 si está encima. */
export function distanciaProtegida(x: number, y: number): number {
  let d = Number.POSITIVE_INFINITY
  for (const u of unidades) d = Math.min(d, Math.hypot(x - u.x, y - u.y) - u.radio)
  for (const s of segmentos) d = Math.min(d, distanciaSegmento(x, y, s) - s.radio)
  for (const b of buzones) d = Math.min(d, Math.hypot(x - b.x, y - b.y) - b.radio)
  return Math.max(0, d)
}
