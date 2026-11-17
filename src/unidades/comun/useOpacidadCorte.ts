import { opacidadCorte } from './corte'
import { useCorteActivo } from './useCorteActivo'

/** Opacidad de los muros y techos según "Ver corte" (undefined = opacos); solo se aclara la estructura que se corta. */
export function useOpacidadCorte(): number | undefined {
  return opacidadCorte(useCorteActivo())
}
