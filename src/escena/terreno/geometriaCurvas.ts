import type { CurvaTerreno } from '../../nucleo/terreno'

/** Pares de puntos (x, y, z de la escena) de los tramos de las curvas de los tipos pedidos, para dibujar con líneas sueltas. */
export function segmentosCurvas(curvas: CurvaTerreno[], tipos: readonly string[], referencia: number, elevacion: number): Float32Array {
  const usadas = curvas.filter((c) => tipos.includes(c.tipo))
  const total = usadas.reduce((s, c) => s + (c.puntos.length - 1), 0)
  const salida = new Float32Array(total * 6)
  let k = 0
  for (const c of usadas) {
    const y = c.cota - referencia + elevacion
    for (let i = 1; i < c.puntos.length; i++) {
      salida.set([c.puntos[i - 1][0], y, -c.puntos[i - 1][1], c.puntos[i][0], y, -c.puntos[i][1]], k)
      k += 6
    }
  }
  return salida
}
