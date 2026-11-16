import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const UNIDADES = ['bombeo', 'rejas', 'desarenador', 'parshall', 'rafa', 'percolador', 'comun']

function archivos(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((f) => (f.isDirectory() ? archivos(join(dir, f.name)) : /\.(ts|tsx)$/.test(f.name) && !f.name.includes('.test.') ? [join(dir, f.name)] : []))
}

describe('colores de las estructuras', () => {
  const tokens = readFileSync('src/ui/tokens.css', 'utf8')
  const definidos = new Set([...tokens.matchAll(/(--color-[\w-]+)\s*:/g)].map((m) => m[1]))

  it('cada color que usan las piezas existe en src/ui/tokens.css', () => {
    const usados = new Map<string, string>()
    for (const u of UNIDADES)
      for (const f of archivos(join('src/unidades', u)))
        for (const m of readFileSync(f, 'utf8').matchAll(/'(--color-[\w-]+)'/g)) usados.set(m[1], f)
    expect(usados.size).toBeGreaterThan(5)
    for (const [color, f] of usados) expect(definidos.has(color), `${color} (en ${f}) no está en tokens.css`).toBe(true)
  })
})
