import { describe, expect, it } from 'vitest'
import { OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { OPACIDAD_ZONA_MEZCLA } from '../../nucleo/constantes'
import { opacidadCorte } from '../comun/corte'
import { opacidadPieza } from './opacidad'

describe('opacidad de las piezas del homogeneizador', () => {
  it('sin "Ver corte" el muro y la losa del techo son opacos', () => {
    expect(opacidadPieza('muro', opacidadCorte(false))).toBeUndefined()
    expect(opacidadPieza('losa-techo', opacidadCorte(false))).toBeUndefined()
  })

  it('con "Ver corte" el muro y la losa del techo usan la misma opacidad que las demás unidades', () => {
    expect(opacidadPieza('muro', opacidadCorte(true))).toBe(OPACIDAD_CANAL)
    expect(opacidadPieza('losa-techo', opacidadCorte(true))).toBe(OPACIDAD_CANAL)
  })

  it('la zona de mezcla siempre es translúcida y el resto de las piezas nunca', () => {
    expect(opacidadPieza('zona-mezcla', opacidadCorte(false))).toBe(OPACIDAD_ZONA_MEZCLA)
    expect(opacidadPieza('zona-mezcla', opacidadCorte(true))).toBe(OPACIDAD_ZONA_MEZCLA)
    for (const t of ['solado', 'losa-fondo', 'ingreso', 'salida', 'rebose', 'agitador', 'riel'] as const) expect(opacidadPieza(t, opacidadCorte(true)), t).toBeUndefined()
  })
})
