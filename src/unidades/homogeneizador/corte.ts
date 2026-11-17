import { planta } from '../planta'
import { usePlanosCorte } from '../comun/usePlanosCorte'

/**
 * Giro (rad) con el que el homogeneizador arma su plano de corte: el del RAFA (datos/planta.json), para que quite la misma mitad
 * del mundo y deje la misma cara cortada (T16.4.2). El tanque es redondo y no tiene giro propio que lo impida.
 */
export const giroCorteHomogeneizador = (planta.unidades.find((u) => u.id === 'rafa')!.giro.valor * Math.PI) / 180

/** Planos de recorte del homogeneizador (mismo gancho que las demás unidades, con el giro de referencia del RAFA). */
export const usePlanosCorteTanque = (radio: number) => usePlanosCorte(radio, giroCorteHomogeneizador)
