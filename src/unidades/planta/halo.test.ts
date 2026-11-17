import { describe, expect, it } from 'vitest'
import { TRANSICION_EXPLANADA, alturaEn, aplanar, cuadricula, terreno } from '../../nucleo/terreno'
import { planta } from './index'

const natural = cuadricula(terreno, 1)
const u = planta.unidades.find((x) => x.id === 'homogeneizador')!
const aplanado = aplanar(
  natural,
  planta.unidades.map((p) => ({ x: p.x.valor, y: p.y.valor, cota: p.cotaSuperficie.valor, radio: p.radioExplanada.valor })),
  TRANSICION_EXPLANADA,
)
const terrenoNatural = alturaEn(natural, u.x.valor, u.y.valor) ?? NaN

/** Mayor diferencia (m) entre el terreno aplanado y el natural a menos de `radio` m del centro del homogeneizador. */
function mayorCambio(radio: number): number {
  let mayor = 0
  for (let a = 0; a < 360; a += 15) {
    for (let r = 0; r <= radio; r += 1) {
      const x = u.x.valor + r * Math.cos((a * Math.PI) / 180)
      const y = u.y.valor + r * Math.sin((a * Math.PI) / 180)
      mayor = Math.max(mayor, Math.abs((alturaEn(aplanado, x, y) ?? 0) - (alturaEn(natural, x, y) ?? 0)))
    }
  }
  return mayor
}

describe('T16.2 · halo del homogeneizador', () => {
  it('la explanada queda en el terreno natural del centro (≈ 2987.3), derivada y de ejemplo, y no en la coronación del perfil', () => {
    expect(Math.abs(u.cotaSuperficie.valor - terrenoNatural)).toBeLessThanOrEqual(0.1)
    expect(u.cotaSuperficie.fuente).toContain('derivado')
    expect(u.cotaSuperficie.demo).toBe(true)
    expect(u.cotaCoronacion.valor).toBeCloseTo(2990.65, 6)
  })

  it('el tanque sale del suelo ≈ 3.4 m y la contradicción con el perfil queda anotada como por revisar', () => {
    expect(u.cotaCoronacion.valor - u.cotaSuperficie.valor).toBeCloseTo(3.35, 1)
    expect(u.cotaSuperficie.fuente).toContain('POR REVISAR CON EL PERFIL REAL')
  })

  it('el radio de la explanada es ≈ 4.5 m, derivado y de ejemplo (el tanque mide 3.99 m de radio por fuera)', () => {
    expect(u.radioExplanada.valor).toBeCloseTo(4.5, 6)
    expect(u.radioExplanada.fuente).toContain('derivado')
    expect(u.radioExplanada.demo).toBe(true)
  })

  it('la explanada ya no levanta el terreno como un montículo: cambia menos de 4 m a menos de 14 m del tanque (antes ≈ 8.6 m)', () => {
    expect(mayorCambio(14)).toBeLessThan(4)
  })
})
