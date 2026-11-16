import { readFileSync } from 'node:fs'
import DxfParser from 'dxf-parser'

export type TipoCurva = 'menor' | 'intermedia' | 'mayor'
export interface CurvaUtm {
  cota: number
  tipo: TipoCurva
  /** Vértices [x, y] en UTM. */
  puntos: [number, number][]
}

/** Capa del DXF de cada tipo de curva de nivel. */
const CAPAS: Record<string, TipoCurva> = {
  Contour_Line_Minor: 'menor',
  Contour_Line_Intermediate: 'intermedia',
  Contour_Line_Major: 'mayor',
}

/** Lee las curvas de nivel de un DXF: la cota está en la coordenada Z de los vértices. Ignora el resto. */
export function leerCurvas(ruta: string): CurvaUtm[] {
  const dxf = new DxfParser().parseSync(readFileSync(ruta, 'utf8'))
  const curvas: CurvaUtm[] = []
  for (const e of dxf?.entities ?? []) {
    const tipo = CAPAS[e.layer ?? '']
    const vertices = (e as { vertices?: { x: number; y: number; z?: number }[] }).vertices
    if (!tipo || !vertices || vertices.length < 2) continue
    const cota = vertices[0].z
    if (cota === undefined || !Number.isFinite(cota)) continue
    curvas.push({ cota, tipo, puntos: vertices.map((v) => [v.x, v.y]) })
  }
  return curvas
}
