import type { Unidad } from '../../unidades/tipos'
import { CotaPuntero } from './CotaPuntero'
import { CurvasNivel } from './CurvasNivel'
import { Muro } from './Muro'
import { Terreno } from './Terreno'

/** Terreno real con curvas de nivel, muro de contención y cota bajo el mouse. */
export function EntornoTerreno({ referencia, unidades }: { referencia: number; unidades: Unidad[] }) {
  return (
    <>
      <Terreno referencia={referencia} />
      <CurvasNivel referencia={referencia} unidades={unidades} />
      <Muro referencia={referencia} />
      <CotaPuntero referencia={referencia} />
    </>
  )
}
