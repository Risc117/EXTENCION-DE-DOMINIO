import type { Punto } from './puntos'

/** Landmarks de ejemplo (21 puntos) para las pruebas: mano abierta con la muñeca abajo. */
export function manoAbierta(dx = 0, dy = 0, apertura = 0.12): Punto[] {
  const p: Punto[] = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.8 }))
  const columnas = [0.44, 0.5, 0.56, 0.62]
  const bases = [5, 9, 13, 17]
  columnas.forEach((x, k) => {
    const b = bases[k]
    p[b] = { x, y: 0.6 }
    p[b + 1] = { x, y: 0.5 }
    p[b + 2] = { x, y: 0.42 }
    p[b + 3] = { x, y: 0.35 }
  })
  p[4] = { x: 0.44 - apertura, y: 0.5 }
  return p.map((q) => ({ x: q.x + dx, y: q.y + dy }))
}

/** Puño: las puntas de los cuatro dedos vuelven cerca de la muñeca. */
export function manoPuno(): Punto[] {
  const p = manoAbierta(0, 0, 0)
  for (const punta of [8, 12, 16, 20]) p[punta] = { x: p[punta - 3].x, y: 0.7 }
  for (const media of [6, 10, 14, 18]) p[media] = { x: p[media - 1].x, y: 0.6 }
  return p
}

/** Mano con solo algunos dedos extendidos (índice, medio, anular, meñique); los demás quedan cerrados como en el puño. */
export function manoConDedos(extendidos: [boolean, boolean, boolean, boolean]): Punto[] {
  const p = manoPuno()
  const abierta = manoAbierta()
  extendidos.forEach((e, k) => {
    if (!e) return
    const base = 5 + 4 * k
    for (const i of [base + 1, base + 2, base + 3]) p[i] = abierta[i]
  })
  return p
}
