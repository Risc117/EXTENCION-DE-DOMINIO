import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { REVISION_PRESENTES_S } from '../../nucleo/constantesVida'
import { solActual } from '../ambiente/sol'
import { quienesActuan, type Presentes } from './horario'

const iguales = (a: Presentes, b: Presentes): boolean => a.tecnicos === b.tecnicos && a.vehiculos === b.vehiculos && a.vigilante === b.vigilante && a.faros === b.faros

/** Quiénes actúan ahora según la hora del día de la escena; solo se redibuja cuando algo cambia. */
export function usePresentes(tecnicos: number, vehiculos: number): Presentes {
  const [p, fijar] = useState(() => quienesActuan(solActual().elevacion, tecnicos, vehiculos))
  const espera = useRef(0)
  useFrame((_, dt) => {
    espera.current -= dt
    if (espera.current > 0) return
    espera.current = REVISION_PRESENTES_S
    const nuevo = quienesActuan(solActual().elevacion, tecnicos, vehiculos)
    fijar((a) => (iguales(a, nuevo) ? a : nuevo))
  })
  return p
}
