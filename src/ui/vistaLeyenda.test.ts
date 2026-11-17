import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { esquemaLeyenda } from '../nucleo/leyendaEsquema'
import { leyenda } from './datosLeyenda'

const tokens = readFileSync('src/ui/tokens.css', 'utf8')

describe('datos de la leyenda', () => {
  it('cada entrada tiene fuente y un color que existe en tokens.css', () => {
    for (const g of leyenda.grupos) {
      for (const e of g.entradas) {
        expect(e.fuente.length).toBeGreaterThan(10)
        expect(tokens, `${e.token} no está en tokens.css`).toContain(`${e.token}:`)
      }
    }
  })
  it('trae los colores de tuberías del plano: celeste = agua residual, rojo = efluente tratado, naranja = lodos, y el biogás', () => {
    const e = Object.fromEntries(leyenda.grupos.flatMap((g) => g.entradas).map((x) => [x.id, x]))
    expect(e.residual.token).toBe('--color-tub-residual')
    expect(e.efluente.token).toBe('--color-tub-efluente')
    expect(e.lodos.token).toBe('--color-tub-lodos')
    expect(e.biogas.token).toBe('--color-tub-biogas')
    expect(tokens).toMatch(/--color-tub-efluente: #d9453b/)
    expect(tokens).toMatch(/--color-tub-lodos: #e8892b/)
  })
  it('incluye los tipos de estructura de la leyenda del plano', () => {
    const nombres = leyenda.grupos.flatMap((g) => g.entradas.map((x) => x.nombre))
    for (const n of ['Unidad de tratamiento', 'Edificación', 'Cerco perimétrico', 'Árbol', 'Franja verde (pasto)', 'Radio de seguridad', 'Luminaria']) expect(nombres).toContain(n)
  })
  it('el esquema rechaza un color que no es un token, una forma desconocida y entradas repetidas', () => {
    const a = structuredClone(leyenda)
    a.grupos[0].entradas[0].token = '#ff0000'
    expect(esquemaLeyenda.safeParse(a).success).toBe(false)
    const b = structuredClone(leyenda)
    ;(b.grupos[0].entradas[0] as { forma: string }).forma = 'estrella'
    expect(esquemaLeyenda.safeParse(b).success).toBe(false)
    const c = structuredClone(leyenda)
    c.grupos[1].entradas[0].id = c.grupos[0].entradas[0].id
    expect(esquemaLeyenda.safeParse(c).success).toBe(false)
  })
})
