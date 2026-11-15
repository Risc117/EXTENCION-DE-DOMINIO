import type { DatosPlanta } from './planta/esquema'
import { unidadPlantaEsDemo } from './planta/esquema'
import type { Unidad, UnidadBase } from './tipos'

/**
 * Junta cada unidad con su lugar en la planta, en el orden de planta.json.
 * Falla si una unidad no tiene lugar o si el plano nombra una unidad que no existe ni tiene marcador.
 */
export function ubicar(bases: UnidadBase[], planta: DatosPlanta): Unidad[] {
  for (const b of bases) {
    if (!planta.unidades.some((p) => p.id === b.id)) throw new Error(`La unidad "${b.id}" no está en datos/planta.json`)
  }
  return planta.unidades.map((p) => {
    const base = bases.find((b) => b.id === p.id)
    if (!base) throw new Error(`La unidad "${p.id}" de planta.json no existe y no tiene marcador`)
    return {
      ...base,
      demo: base.demo || unidadPlantaEsDemo(p),
      posicion: { x: p.x.valor, y: p.y.valor },
      giro: p.giro.valor,
      cotaFondo: p.cotaFondo.valor,
    }
  })
}

/** Cota que queda en el suelo de la escena (y = 0): la más baja de la planta. */
export function cotaReferencia(unidades: Pick<Unidad, 'cotaFondo'>[]): number {
  return Math.min(...unidades.map((u) => u.cotaFondo))
}

/** Posición en la escena (x este, y arriba, z sur) de una unidad. */
export function posicionEscena(u: Pick<Unidad, 'posicion' | 'cotaFondo'>, referencia: number): [number, number, number] {
  return [u.posicion.x, u.cotaFondo - referencia, -u.posicion.y]
}

/** Giro en radianes para three.js. */
export const giroEscena = (u: Pick<Unidad, 'giro'>): number => (u.giro * Math.PI) / 180
