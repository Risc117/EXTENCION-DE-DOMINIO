import { existsSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { todasLasMedidas } from '../comun/medidas'
import { centroDe, creditos, vida } from './datos'
import { esquemaVida } from './esquema'

describe('datos de la vida', () => {
  it('todo lo estimado es Dato de ejemplo', () => {
    const medidas = todasLasMedidas(vida).filter((m) => !m.fuente.startsWith('Semilla'))
    expect(medidas.length).toBeGreaterThan(10)
    for (const m of medidas) expect(m.demo).toBe(true)
    for (const c of Object.values(vida.cantidades)) expect(c.demo).toBe(true)
  })
  it('la franja verde viene del plano (13 puntos del DXF, capa PTAR-FRANJA-VERDE)', () => {
    expect(vida.pasto.franja.puntos).toHaveLength(13)
    expect(vida.pasto.franja.fuente).toContain('PTAR-FRANJA-VERDE')
  })
  it('en calidad baja hay menos que en alta', () => {
    for (const c of Object.values(vida.cantidades)) expect(c.baja).toBeLessThanOrEqual(c.alta)
    expect(vida.cantidades.pasto.baja).toBeLessThan(vida.cantidades.pasto.alta)
  })
  it('las palomas y las moscas están en el lecho de secado de datos/planta.json', () => {
    expect(centroDe(vida.paloma.lecho)).toEqual({ x: 5.5, y: -7 })
    expect(centroDe(vida.mosca.lecho)).toEqual({ x: 5.5, y: -7 })
    expect(() => centroDe('no-existe')).toThrow()
  })
  it('el esquema rechaza más animales en calidad baja que en alta y un modelo que no es .glb', () => {
    const malo = structuredClone(vida)
    malo.cantidades.aves.baja = 99
    expect(esquemaVida.safeParse(malo).success).toBe(false)
    const otro = structuredClone(vida)
    otro.perro.modelo = 'perro.obj'
    expect(esquemaVida.safeParse(otro).success).toBe(false)
  })
})

describe('créditos de los modelos .glb (solo CC0)', () => {
  const carpeta = 'public/modelos'
  const glb = readdirSync(carpeta).filter((f) => f.endsWith('.glb'))
  it('cada modelo de public/modelos/ tiene autor, enlace y licencia CC0, y cada crédito tiene su archivo', () => {
    expect(glb.length).toBeGreaterThan(0)
    for (const f of glb) expect(creditos.modelos.some((m) => m.archivo === `${carpeta}/${f}`)).toBe(true)
    for (const m of creditos.modelos) expect(existsSync(m.archivo)).toBe(true)
  })
  it('los modelos que usan los datos existen y están en los créditos', () => {
    for (const nombre of [vida.perro.modelo, vida.paloma.modelo, vida.ave.modelo, vida.garza.modelo, vida.mosca.modelo]) {
      expect(creditos.modelos.some((m) => m.archivo === `${carpeta}/${nombre}`)).toBe(true)
    }
  })
})
