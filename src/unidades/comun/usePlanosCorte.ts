import { useContext, useMemo } from 'react'
import { Plane, Vector3 } from 'three'
import { useCorte } from '../../estado/flujo'
import { ContextoUbicacion } from '../contextoUbicacion'
import { planoCorteMundo } from './corte'

const SIN_PLANOS: Plane[] = []

/**
 * Planos de recorte de three.js según el estado del corte (lista vacía si no hay corte). Van en coordenadas del mundo.
 * `giroCorte` (rad) hace que la unidad quite la misma mitad del mundo que una unidad con ese giro.
 */
export function usePlanosCorte(radio: number, giroCorte?: number): Plane[] {
  const activo = useCorte((s) => s.activo)
  const posicion = useCorte((s) => s.posicion)
  const ubicacion = useContext(ContextoUbicacion)
  return useMemo(() => {
    const p = planoCorteMundo(activo, posicion, radio, ubicacion, giroCorte)
    return p ? [new Plane(new Vector3(...p.normal), p.constante)] : SIN_PLANOS
  }, [activo, posicion, radio, ubicacion, giroCorte])
}
