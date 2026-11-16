import { readFileSync } from 'node:fs'
import DxfParser from 'dxf-parser'

type Punto = [number, number]
export interface Rotulo {
  texto: string
  x: number
  y: number
}

/** Zona UTM (norte) donde está dibujada la planta sobre el terreno: el DXF repite el dibujo más al norte y en vistas de detalle. */
export interface ZonaPlanta {
  este: [number, number]
  norte: [number, number]
}

const dentro = (p: { x: number; y: number }, z: ZonaPlanta): boolean => p.x >= z.este[0] && p.x <= z.este[1] && p.y >= z.norte[0] && p.y <= z.norte[1]

/** Lee el mapa general una sola vez (pesa ~28 MB). */
export function leerPlano(ruta: string) {
  const dxf = new DxfParser().parseSync(readFileSync(ruta, 'utf8'))
  return dxf?.entities ?? []
}
export type Entidades = ReturnType<typeof leerPlano>

/** Rótulos de texto de una capa dentro de la zona de la planta, con su punto de inserción. */
export function leerRotulos(entidades: Entidades, capa: string, zona: ZonaPlanta): Rotulo[] {
  const salida: Rotulo[] = []
  for (const e of entidades) {
    const t = e as { type: string; layer?: string; text?: string; startPoint?: { x: number; y: number }; position?: { x: number; y: number } }
    const p = t.startPoint ?? t.position
    if (t.type !== 'TEXT' || t.layer !== capa || !t.text || !p || !dentro(p, zona)) continue
    salida.push({ texto: t.text.replace(/\s+/g, ' ').trim(), x: p.x, y: p.y })
  }
  return salida
}

/**
 * Cara exterior del muro de contención: la polilínea abierta más al norte de la capa dada dentro de la zona
 * (el muro se dibuja con dos polilíneas, cara exterior e interior, a 0.30 m).
 */
export function leerTrazoMuro(entidades: Entidades, capa: string, zona: ZonaPlanta): Punto[] {
  const candidatas = entidades
    .filter((e) => e.type === 'LWPOLYLINE' && e.layer === capa)
    .map((e) => (e as unknown as { vertices: { x: number; y: number }[]; shape?: boolean }))
    .filter((e) => !e.shape && e.vertices.length >= 3 && e.vertices.every((v) => dentro(v, zona)))
  if (candidatas.length === 0) throw new Error(`No hay polilíneas de muro en la capa ${capa} dentro de la zona`)
  const exterior = candidatas.reduce((a, b) => (b.vertices[0].y > a.vertices[0].y ? b : a))
  return exterior.vertices.map((v) => [v.x, v.y])
}
