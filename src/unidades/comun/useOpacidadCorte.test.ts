import { describe, expect, it } from 'vitest'
import { useCorte } from '../../estado/flujo'
import { OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { opacidadCorte } from './corte'

describe('opacidad según el estado del corte (lo que lee useOpacidadCorte)', () => {
  it('sigue el botón "Ver corte": opacos al principio y translúcidos al activarlo', () => {
    const antes = useCorte.getState().activo
    expect(opacidadCorte(useCorte.getState().activo)).toBe(antes ? OPACIDAD_CANAL : undefined)
    useCorte.getState().alternarCorte()
    expect(opacidadCorte(useCorte.getState().activo)).toBe(antes ? undefined : OPACIDAD_CANAL)
    useCorte.getState().alternarCorte()
  })
})
