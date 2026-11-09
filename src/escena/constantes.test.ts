import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Escena.tsx', () => {
  it('no tiene números sueltos: cámara y luces vienen de nucleo/constantes.ts', () => {
    const codigo = readFileSync('src/escena/Escena.tsx', 'utf8')
    expect(codigo.match(/\d+(\.\d+)?/g) ?? []).toEqual([])
  })
})
