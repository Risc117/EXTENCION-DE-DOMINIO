import type { CurvaTerreno } from '../../nucleo/terreno'

type Punto = [number, number]

/**
 * Pares de puntos (x, y, z de la escena) de los tramos de las curvas de los tipos pedidos, para dibujar con líneas sueltas.
 * Un tramo con sus dos extremos en un lugar donde el terreno ya no es el natural (`modificado`) no se dibuja.
 */
export function segmentosCurvas(curvas: CurvaTerreno[], tipos: readonly string[], referencia: number, elevacion: number, modificado: (p: Punto) => boolean = () => false): Float32Array {
  const usadas = curvas.filter((c) => tipos.includes(c.tipo))
  const salida: number[] = []
  for (const c of usadas) {
    const y = c.cota - referencia + elevacion
    for (let i = 1; i < c.puntos.length; i++) {
      const [a, b] = [c.puntos[i - 1], c.puntos[i]]
      if (modificado(a) && modificado(b)) continue
      salida.push(a[0], y, -a[1], b[0], y, -b[1])
    }
  }
  return Float32Array.from(salida)
}
