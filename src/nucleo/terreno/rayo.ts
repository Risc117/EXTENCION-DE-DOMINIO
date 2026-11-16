import { alturaEn, type Cuadricula } from './altura'

export type V3 = [number, number, number]

/**
 * Dónde un rayo toca el terreno. El rayo y el resultado están en la escena (x este, y arriba, z sur);
 * `referencia` es la cota que queda en y = 0. Devuelve x, y (m locales) y la cota, o null si no lo toca.
 */
export function rayoContraTerreno(g: Cuadricula, referencia: number, origen: V3, direccion: V3, alcance: number): { x: number; y: number; cota: number } | null {
  const paso = g.paso / 2
  const cota = (t: number) => {
    const x = origen[0] + direccion[0] * t
    const z = origen[2] + direccion[2] * t
    const h = alturaEn(g, x, -z)
    return h === null ? null : { x, y: -z, h, sobre: origen[1] + direccion[1] * t - (h - referencia) }
  }
  let anterior = 0
  for (let t = 0; t <= alcance; t += paso) {
    const p = cota(t)
    if (p && p.sobre <= 0) {
      // Afina entre el paso anterior y este por bisección.
      let [a, b] = [anterior, t]
      for (let k = 0; k < 12; k++) {
        const m = (a + b) / 2
        const q = cota(m)
        if (q && q.sobre <= 0) b = m
        else a = m
      }
      const r = cota(b)
      return r ? { x: r.x, y: r.y, cota: r.h } : null
    }
    if (p) anterior = t
  }
  return null
}
