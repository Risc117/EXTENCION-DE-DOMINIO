import { describe, expect, it } from 'vitest'
import { useCorte } from '../../estado/flujo'
import { OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { opacidadCorte, planoCorte, puntosEspiral } from './corte'

describe('planoCorte', () => {
  it('sin corte no hay plano', () => {
    expect(planoCorte(false, 0.5, 3.79)).toBeNull()
  })

  it('el plano se mueve con el deslizador (fracción del radio)', () => {
    const centro = planoCorte(true, 0, 3.79)
    const lado = planoCorte(true, 0.5, 3.79)
    expect(centro?.constante).toBeCloseTo(0, 6)
    expect(lado?.constante).toBeCloseTo(0.5 * 3.79, 6)
  })

  it('recorta lo que queda del lado +z del plano', () => {
    const p = planoCorte(true, 0, 3.79)!
    const [nx, ny, nz] = p.normal
    const distancia = (z: number) => nx * 0 + ny * 0 + nz * z + p.constante
    expect(distancia(1)).toBeLessThan(0)
    expect(distancia(-1)).toBeGreaterThan(0)
  })
})

describe('estado del corte', () => {
  it('el botón activa y desactiva, y el deslizador guarda la posición', () => {
    const s = useCorte.getState()
    const antes = s.activo
    s.alternarCorte()
    expect(useCorte.getState().activo).toBe(!antes)
    s.fijarPosicionCorte(0.4)
    expect(useCorte.getState().posicion).toBe(0.4)
    s.alternarCorte()
    expect(useCorte.getState().activo).toBe(antes)
  })
})

describe('puntosEspiral', () => {
  it('va del centro hasta el radio de la zona de mezcla', () => {
    const pts = puntosEspiral(1.5, 3, 100)
    expect(pts).toHaveLength(100)
    expect(Math.hypot(pts[0][0], pts[0][2])).toBeCloseTo(0, 6)
    expect(Math.hypot(pts[99][0], pts[99][2])).toBeCloseTo(1.5, 6)
    for (const p of pts) expect(p[1]).toBe(0)
  })
})

describe('opacidadCorte (el mismo criterio de "Ver corte" para todas las unidades)', () => {
  it('sin corte los muros son opacos y con corte son translúcidos', () => {
    expect(opacidadCorte(false)).toBeUndefined()
    expect(opacidadCorte(true)).toBe(OPACIDAD_CANAL)
    expect(OPACIDAD_CANAL).toBeLessThan(1)
  })
})
