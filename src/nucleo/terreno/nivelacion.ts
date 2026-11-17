import type { Cuadricula } from './altura'
import type { Ventana } from './recorte'

/** Una zona que se lleva a una cota propia (plataforma de un edificio, vía): fuera de su zona plana el terreno sube o baja con un talud. */
export interface FuenteNivel {
  id: string
  /** Fuera de esta caja (m locales) la fuente no influye. */
  caja: Ventana
  /** En (x, y): metros más allá de la zona plana (0 dentro), cota del piso ahí y si el punto cuenta para la holgura (`libre`). */
  en: (x: number, y: number) => { distancia: number; cota: number; libre: boolean }
}

export interface OpcionesNivel {
  /** Talud (m horizontales por cada m vertical): se prueba desde el máximo y se baja de `paso` en `paso` hasta el mínimo. */
  taludMaximo: number
  taludMinimo: number
  paso: number
  /** Metros que debe quedar el talud lejos de lo hidráulico. */
  holgura: number
  /** Los nodos a menos de estos metros de lo hidráulico (dentro de una unidad o encima de una tubería) no se consideran nunca. */
  umbral: number
}

export interface InformeNivel {
  id: string
  /** Talud usado (H por V). */
  talud: number
  /** true si hubo que usar uno más empinado que el máximo. */
  reducido: boolean
  /** Distancia mínima (m) de lo modificado a lo hidráulico (Infinity si no hay nada cerca). */
  holgura: number
  /** true si la holgura llega a la pedida. */
  cumple: boolean
  nodosModificados: number
}

interface Cambio {
  i: number
  cota: number
  holgura: number
  libre: boolean
}

/** Nodos que cambiarían con este talud: la cota se acerca al piso, pero a una distancia d solo se aparta de él hasta d / talud (talud 1:H). */
function cambios(g: Cuadricula, f: FuenteNivel, talud: number, protegida: (x: number, y: number) => number, umbral: number, fijos: Set<number>): Cambio[] {
  const lista: Cambio[] = []
  for (let fila = 0; fila < g.filas; fila++) {
    const y = g.y0 + fila * g.paso
    if (y < f.caja.yMin || y > f.caja.yMax) continue
    for (let c = 0; c < g.columnas; c++) {
      const px = g.x0 + c * g.paso
      if (px < f.caja.xMin || px > f.caja.xMax) continue
      const { distancia, cota, libre } = f.en(px, y)
      const i = fila * g.columnas + c
      if (fijos.has(i)) continue
      const natural = g.cotas[i]
      const nueva = cota + Math.max(-distancia / talud, Math.min(distancia / talud, natural - cota))
      if (Math.abs(nueva - natural) < 1e-9) continue
      const prot = protegida(px, y)
      if (prot < umbral) continue
      lista.push({ i, cota: nueva, holgura: prot, libre })
    }
  }
  return lista
}

/** Aplica las fuentes una por una; a cada una le busca el talud más suave que deje `holgura` metros libres de lo hidráulico. No mueve nada: solo cambia cotas de nodos. */
export function nivelarFuentes(g: Cuadricula, fuentes: FuenteNivel[], protegida: (x: number, y: number) => number, o: OpcionesNivel): { cuadricula: Cuadricula; informe: InformeNivel[] } {
  const cotas = g.cotas.slice()
  const informe: InformeNivel[] = []
  // Nodos de la zona plana de una fuente ya aplicada: las siguientes no los tocan (el piso de un edificio manda sobre el talud de la vía).
  const fijos = new Set<number>()
  for (const f of fuentes) {
    const actual: Cuadricula = { ...g, cotas }
    let talud = o.taludMaximo
    let elegido = cambios(actual, f, talud, protegida, o.umbral, fijos)
    const holguraDe = (l: Cambio[]) => l.filter((c) => c.libre).reduce((m, c) => Math.min(m, c.holgura), Number.POSITIVE_INFINITY)
    while (holguraDe(elegido) < o.holgura && talud - o.paso >= o.taludMinimo - 1e-9) {
      talud -= o.paso
      elegido = cambios(actual, f, talud, protegida, o.umbral, fijos)
    }
    // Nada se modifica a menos de «holgura» m de lo hidráulico (aunque no se haya podido alejar el talud).
    for (const c of elegido) if (c.holgura >= o.holgura) cotas[c.i] = c.cota
    for (let fila = 0; fila < g.filas; fila++) {
      for (let c = 0; c < g.columnas; c++) {
        const [px, py] = [g.x0 + c * g.paso, g.y0 + fila * g.paso]
        if (px >= f.caja.xMin && px <= f.caja.xMax && py >= f.caja.yMin && py <= f.caja.yMax && f.en(px, py).distancia === 0 && protegida(px, py) >= o.holgura) fijos.add(fila * g.columnas + c)
      }
    }
    const holgura = holguraDe(elegido)
    informe.push({ id: f.id, talud, reducido: talud < o.taludMaximo, holgura, cumple: holgura >= o.holgura, nodosModificados: elegido.filter((c) => c.holgura >= o.holgura).length })
  }
  return { cuadricula: { ...g, cotas }, informe }
}
