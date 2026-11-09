import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const eslint = new ESLint()

async function mensajes(ruta: string, codigo: string) {
  const [res] = await eslint.lintText(codigo, { filePath: ruta })
  return res.messages.filter((m) => m.ruleId === 'boundaries/dependencies')
}

describe('reglas de arquitectura (ESLint)', () => {
  it('falla si escena/ importa de simulacion/', async () => {
    const m = await mensajes('src/escena/falso.ts', "import '../simulacion/index'\n")
    expect(m.length).toBeGreaterThan(0)
  })

  it('falla si simulacion/ importa de escena/ o ui/', async () => {
    expect((await mensajes('src/simulacion/falso.ts', "import '../escena/Escena'\n")).length).toBeGreaterThan(0)
    expect((await mensajes('src/simulacion/falso.ts', "import '../ui/AvisoDemo'\n")).length).toBeGreaterThan(0)
  })

  it('falla si entrada/ importa de escena/ o ui/', async () => {
    expect((await mensajes('src/entrada/falso.ts', "import '../escena/Escena'\n")).length).toBeGreaterThan(0)
    expect((await mensajes('src/entrada/falso.ts', "import '../ui/AvisoDemo'\n")).length).toBeGreaterThan(0)
  })

  it('permite que escena/ importe de estado/', async () => {
    expect(await mensajes('src/escena/falso.ts', "import '../estado/almacen'\n")).toHaveLength(0)
  })
})
