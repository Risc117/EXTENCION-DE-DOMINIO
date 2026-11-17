import { useCorte } from '../../estado/flujo'
import { opacidadCorte } from './corte'

/** Opacidad de los muros y techos según "Ver corte" (undefined = opacos). */
export function useOpacidadCorte(): number | undefined {
  return useCorte((s) => opacidadCorte(s.activo))
}
