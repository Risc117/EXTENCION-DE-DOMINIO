import { useMemo } from 'react'
import { Plane, Vector3 } from 'three'
import { useCorte } from '../../estado/flujo'
import { planoCorte } from './corte'

const SIN_PLANOS: Plane[] = []

/** Planos de recorte de three.js según el estado del corte (lista vacía si no hay corte). */
export function usePlanosCorte(radio: number): Plane[] {
  const activo = useCorte((s) => s.activo)
  const posicion = useCorte((s) => s.posicion)
  return useMemo(() => {
    const p = planoCorte(activo, posicion, radio)
    return p ? [new Plane(new Vector3(...p.normal), p.constante)] : SIN_PLANOS
  }, [activo, posicion, radio])
}
