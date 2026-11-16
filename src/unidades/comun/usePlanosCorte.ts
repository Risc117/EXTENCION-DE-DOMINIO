import { useContext, useMemo } from 'react'
import { Plane, Vector3 } from 'three'
import { useCorte } from '../../estado/flujo'
import { ContextoUbicacion } from '../contextoUbicacion'
import { planoAMundo } from '../ubicacion'
import { planoCorte } from './corte'

const SIN_PLANOS: Plane[] = []

/** Planos de recorte de three.js según el estado del corte (lista vacía si no hay corte). Van en coordenadas del mundo. */
export function usePlanosCorte(radio: number): Plane[] {
  const activo = useCorte((s) => s.activo)
  const posicion = useCorte((s) => s.posicion)
  const ubicacion = useContext(ContextoUbicacion)
  return useMemo(() => {
    const local = planoCorte(activo, posicion, radio)
    if (!local) return SIN_PLANOS
    const p = planoAMundo(local, ubicacion)
    return [new Plane(new Vector3(...p.normal), p.constante)]
  }, [activo, posicion, radio, ubicacion])
}
