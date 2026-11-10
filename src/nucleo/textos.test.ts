import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { TEXTO_BIENVENIDA } from './textos'

/** En src/entrada/gestos/interpretar.ts: separar la pinza acerca (zoom < 1) y juntarla aleja. */
describe('texto de los gestos de pinza', () => {
  it('la pantalla inicial dice que separar acerca y juntar aleja', () => {
    expect(TEXTO_BIENVENIDA.gestos).toMatch(/separa el pulgar y el índice para acercar y júntalos para alejar/)
    expect(TEXTO_BIENVENIDA.gestos).not.toMatch(/junta o separa/)
  })

  it('el README dice lo mismo', () => {
    const readme = readFileSync('README.md', 'utf8')
    expect(readme).toMatch(/separar pulgar e índice acerca, juntarlos aleja/)
  })
})
