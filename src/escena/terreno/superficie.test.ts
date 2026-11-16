import { describe, expect, it } from 'vitest'
import { alturaEn } from '../../nucleo/terreno'
import { planta } from '../../unidades/planta'
import { superficieTerreno } from './superficie'

describe('explanadas de datos/planta.json', () => {
  it('cada cota de superficie y cada radio dicen que son derivados', () => {
    for (const u of planta.unidades) {
      expect(u.cotaSuperficie.fuente, u.id).toContain('derivado')
      expect(u.radioExplanada.fuente, u.id).toContain('derivado')
      expect(u.radioExplanada.demo, u.id).toBe(true)
    }
  })

  it('la cota de superficie queda entre el fondo y la coronación', () => {
    for (const u of planta.unidades) {
      expect(u.cotaSuperficie.valor, u.id).toBeGreaterThanOrEqual(u.cotaFondo.valor)
      expect(u.cotaSuperficie.valor, u.id).toBeLessThanOrEqual(u.cotaCoronacion.valor)
    }
  })

  it('con las explanadas puestas, el terreno bajo el centro de cada unidad queda a su cota de superficie', () => {
    const g = superficieTerreno(1)
    for (const u of planta.unidades) expect(alturaEn(g, u.x.valor, u.y.valor)!, u.id).toBeCloseTo(u.cotaSuperficie.valor, 0)
  })

  it('con las explanadas puestas, ninguna unidad flota ni asoma sin que el dato lo justifique', () => {
    const g = superficieTerreno(1)
    for (const u of planta.unidades) {
      const suelo = alturaEn(g, u.x.valor, u.y.valor)!
      expect(u.cotaFondo.valor - suelo, `${u.id} flota`).toBeLessThanOrEqual(0.1)
      expect(suelo - u.cotaCoronacion.valor, `${u.id} queda tapada`).toBeLessThanOrEqual(0.1)
    }
  })
})
