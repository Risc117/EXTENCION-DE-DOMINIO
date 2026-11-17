import { useContext } from 'react'
import { useEstado } from '../../estado/almacen'
import { useCorte } from '../../estado/flujo'
import { ContextoUbicacion } from '../contextoUbicacion'
import { corteEfectivo } from './corte'

/** true si la unidad que lo llama se corta ahora: "Ver corte" está activo y, si el corte es solo de la estructura enfocada, ella es la enfocada. */
export function useCorteActivo(): boolean {
  const activo = useCorte((s) => s.activo)
  const solo = useCorte((s) => s.soloEnfocada)
  const foco = useEstado((s) => s.foco)
  return corteEfectivo(activo, solo, foco, useContext(ContextoUbicacion).id)
}
