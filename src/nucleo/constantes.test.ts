import { describe, expect, it } from 'vitest'
import * as constantes from './constantes'

describe('constantes', () => {
  it('conservan sus nombres y valores (foto tomada antes de dividir el archivo en temas)', () => {
    expect(constantes).toMatchSnapshot()
  })
})
