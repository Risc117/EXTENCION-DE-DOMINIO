interface P {
  x: number
  y: number
}

/** Un camino (bordes de un lado y del otro) y un río (orillas A y B), como están en datos/entorno.json. */
interface Franja {
  margenesA: P[][]
  margenB: P[]
}

export interface GeometriaPuente {
  /** Punto del centro del camino en cada orilla del río. */
  orillaA: P
  orillaB: P
  /** Extremos del tablero: sobresale de cada orilla para apoyar en tierra. */
  inicio: P
  fin: P
  /** Dirección unitaria del eje (de la orilla A a la B) y su normal. */
  direccion: P
  normal: P
  /** Ancho del camino medido perpendicular al eje. */
  ancho: number
  /** Distancia de orilla a orilla y largo total del tablero (con lo que apoya en cada orilla). */
  largoOrillas: number
  largoTotal: number
}

function cruce(p: P, q: P, r: P, s: P): P | null {
  const d = (q.x - p.x) * (s.y - r.y) - (q.y - p.y) * (s.x - r.x)
  if (Math.abs(d) < 1e-12) return null
  const t = ((r.x - p.x) * (s.y - r.y) - (r.y - p.y) * (s.x - r.x)) / d
  const u = ((r.x - p.x) * (q.y - p.y) - (r.y - p.y) * (q.x - p.x)) / d
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? { x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y) } : null
}

/** Puntos donde se cruzan dos grupos de polilíneas. */
function cruces(a: readonly P[][], b: readonly P[][]): P[] {
  const salida: P[] = []
  for (const la of a) for (const lb of b) for (let i = 1; i < la.length; i++) for (let j = 1; j < lb.length; j++) {
    const x = cruce(la[i - 1], la[i], lb[j - 1], lb[j])
    if (x) salida.push(x)
  }
  return salida
}

/** Distancia del punto `p` a la polilínea. */
export function distanciaAPolilinea(p: P, linea: P[]): number {
  let mejor = Number.POSITIVE_INFINITY
  for (let i = 1; i < linea.length; i++) {
    const [dx, dy] = [linea[i].x - linea[i - 1].x, linea[i].y - linea[i - 1].y]
    const largo2 = dx * dx + dy * dy
    const f = largo2 === 0 ? 0 : Math.min(1, Math.max(0, ((p.x - linea[i - 1].x) * dx + (p.y - linea[i - 1].y) * dy) / largo2))
    mejor = Math.min(mejor, Math.hypot(p.x - (linea[i - 1].x + dx * f), p.y - (linea[i - 1].y + dy * f)))
  }
  return mejor
}

/** El único punto donde la orilla cruza ese lado del camino; falla si no hay cruce o hay más de uno. */
function unico(orilla: readonly P[][], lado: readonly P[][], nombre: string): P {
  const c = cruces(orilla, lado)
  if (c.length !== 1) throw new Error(`Se esperaba un solo cruce entre ${nombre} y el camino y hay ${c.length}`)
  return c[0]
}

/**
 * Dónde y cómo se pone el puente donde el camino cruza el río: en cada orilla, el centro del camino (entre sus dos bordes); el eje va de una orilla a la otra;
 * el ancho es el del camino medido perpendicular al eje; y el tablero sobresale `extension` m de cada orilla. Interpretación: el DXF no dibuja un puente.
 */
export function calcularPuente(camino: Franja, rio: Franja, extension: number): GeometriaPuente {
  const ladoB = [camino.margenB]
  const orillas = [rio.margenesA, [rio.margenB]] as const
  const [[a1, b1], [a2, b2]] = orillas.map((o, i) => [unico(o, camino.margenesA, `la orilla ${i === 0 ? 'A' : 'B'} del río`), unico(o, ladoB, `la orilla ${i === 0 ? 'A' : 'B'} del río`)])
  const [orillaA, orillaB] = [{ x: (a1.x + b1.x) / 2, y: (a1.y + b1.y) / 2 }, { x: (a2.x + b2.x) / 2, y: (a2.y + b2.y) / 2 }]
  const largoOrillas = Math.hypot(orillaB.x - orillaA.x, orillaB.y - orillaA.y)
  const direccion = { x: (orillaB.x - orillaA.x) / largoOrillas, y: (orillaB.y - orillaA.y) / largoOrillas }
  const normal = { x: -direccion.y, y: direccion.x }
  const ancho = Math.abs((b1.x - a1.x) * normal.x + (b1.y - a1.y) * normal.y)
  return {
    orillaA,
    orillaB,
    inicio: { x: orillaA.x - direccion.x * extension, y: orillaA.y - direccion.y * extension },
    fin: { x: orillaB.x + direccion.x * extension, y: orillaB.y + direccion.y * extension },
    direccion,
    normal,
    ancho,
    largoOrillas,
    largoTotal: largoOrillas + 2 * extension,
  }
}
