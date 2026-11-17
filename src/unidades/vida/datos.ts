import creditosCrudo from '../../../datos/creditos.json'
import planta from '../../../datos/planta.json'
import vidaCruda from '../../../datos/vida.json'
import { esquemaCreditos, esquemaVida } from './esquema'

/** Pasto, animales y moscas ya validados (datos/vida.json) y créditos de los modelos .glb (datos/creditos.json). */
export const vida = esquemaVida.parse(vidaCruda)
export const creditos = esquemaCreditos.parse(creditosCrudo)

/** Centro (x este, y norte, m) de una unidad de datos/planta.json, por su id. */
export function centroDe(id: string): { x: number; y: number } {
  const u = (planta.unidades as { id: string; x: { valor: number }; y: { valor: number } }[]).find((e) => e.id === id)
  if (!u) throw new Error(`No hay una unidad "${id}" en datos/planta.json`)
  return { x: u.x.valor, y: u.y.valor }
}
