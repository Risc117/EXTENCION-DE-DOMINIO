import type { PiezaCaja } from './tipos'

/** Caja dada por sus límites en x, y y z (m). */
export function cajaEntre(
  id: string,
  color: string,
  [x0, x1]: [number, number],
  [y0, y1]: [number, number],
  [z0, z1]: [number, number],
  extra: Partial<PiezaCaja> = {},
): PiezaCaja {
  return { id, forma: 'caja', color, pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], tam: [x1 - x0, y1 - y0, z1 - z0], ...extra }
}
