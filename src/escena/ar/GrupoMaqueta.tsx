import { useMemo, type ReactNode } from 'react'
import { escalaMaqueta } from '../../nucleo/ar/maqueta'
import { datosAR } from '../../nucleo/ar/datos'
import { useAR } from '../../estado/ar'

/**
 * Agrupa toda la planta. Fuera de AR no hace nada (escala 1, sin desplazamiento); en AR la achica a la maqueta, centrada en el punto tocado,
 * y la esconde hasta que se coloca. Siempre es el mismo grupo para no volver a armar la escena al entrar o salir de AR.
 */
export function GrupoMaqueta({ centro, extension, children }: { centro: [number, number, number]; extension: number; children: ReactNode }) {
  const activo = useAR((s) => s.activo)
  const colocacion = useAR((s) => s.colocacion)
  const escala = useMemo(() => escalaMaqueta(datosAR.anchoMaqueta.valor, extension), [extension])
  const enAR = activo && colocacion !== null
  return (
    <group visible={!activo || enAR} position={enAR ? colocacion : [0, 0, 0]} scale={enAR ? escala : 1}>
      <group position={enAR ? [-centro[0], 0, -centro[2]] : [0, 0, 0]}>{children}</group>
    </group>
  )
}
