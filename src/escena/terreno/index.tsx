import { useTerreno } from '../../estado/terreno'
import type { Unidad } from '../../unidades/tipos'
import { CotaPuntero } from './CotaPuntero'
import { CurvasNivel } from './CurvasNivel'
import { Muro } from './Muro'
import { Terreno } from './Terreno'

/** Terreno real con curvas de nivel, muro de contención y cota bajo el mouse; el botón "Ocultar terreno" lo quita todo. */
export function EntornoTerreno({ referencia, unidades }: { referencia: number; unidades: Unidad[] }) {
  const visible = useTerreno((s) => s.terrenoVisible)
  if (!visible) return null
  return (
    <>
      <Terreno referencia={referencia} />
      <CurvasNivel referencia={referencia} unidades={unidades} />
      <Muro referencia={referencia} />
      <CotaPuntero referencia={referencia} />
    </>
  )
}
