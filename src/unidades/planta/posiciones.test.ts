import { describe, expect, it } from 'vitest'
import { alturaEn, cuadricula, terreno } from '../../nucleo/terreno'
import { planta } from './index'

const malla = cuadricula(terreno)

describe('posiciones de datos/planta.json', () => {
  it('cada x e y dice de qué archivo y capa del DXF sale', () => {
    for (const u of planta.unidades) {
      for (const v of [u.x, u.y]) {
        expect(v.fuente, u.id).toContain('.dxf')
        expect(v.fuente, u.id).toContain('PTAR-TEXTO')
      }
    }
  })

  it('cada unidad cae sobre el terreno levantado', () => {
    for (const u of planta.unidades) expect(alturaEn(malla, u.x.valor, u.y.valor), u.id).not.toBeNull()
  })

  it('las cotas de fondo siguen marcadas como de ejemplo hasta tener el perfil', () => {
    for (const u of planta.unidades) expect(u.cotaFondo.demo, u.id).toBe(true)
  })

  it('las unidades que el plano no separa (desarenador y Parshall) se marcan como ejemplo', () => {
    for (const id of ['desarenador', 'parshall']) expect(planta.unidades.find((u) => u.id === id)?.y.demo).toBe(true)
  })
})
