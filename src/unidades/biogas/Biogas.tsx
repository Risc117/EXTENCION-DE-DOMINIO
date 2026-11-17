import { useEntorno } from '../../estado/entorno'
import { Antorcha } from './Antorcha'
import { LineaBiogas } from './LineaBiogas'

/** Antorcha y línea de biogás (T20). Se ocultan junto con el entorno de la planta. */
export function Biogas({ referencia }: { referencia: number }) {
  const visible = useEntorno((s) => s.visible)
  if (!visible) return null
  return (
    <group>
      <LineaBiogas referencia={referencia} />
      <Antorcha referencia={referencia} />
    </group>
  )
}
