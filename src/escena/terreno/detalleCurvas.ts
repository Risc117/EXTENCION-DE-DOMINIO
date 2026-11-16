import { DISTANCIA_CURVAS_DETALLE } from '../../nucleo/terreno'
import type { Unidad } from '../../unidades/tipos'
import { encuadre } from '../encuadre'

/** Distancia (m) de la cámara al punto que mira: la distancia relativa del estado por la escala del encuadre. */
export function radioCamara(unidades: Unidad[], foco: string | null, distancia: number): number {
  return distancia * encuadre(unidades, foco).escala
}

/** Las curvas de cada metro solo se dibujan con la cámara cerca. */
export const hayDetalleCurvas = (radio: number): boolean => radio <= DISTANCIA_CURVAS_DETALLE
