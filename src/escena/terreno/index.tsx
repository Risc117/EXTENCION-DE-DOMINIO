import { CotaPuntero } from './CotaPuntero'
import { CurvasNivel } from './CurvasNivel'
import { Muro } from './Muro'
import { Terreno } from './Terreno'

/** Terreno real con curvas de nivel, muro de contención y cota bajo el mouse. */
export function EntornoTerreno({ referencia }: { referencia: number }) {
  return (
    <>
      <Terreno referencia={referencia} />
      <CurvasNivel referencia={referencia} />
      <Muro referencia={referencia} />
      <CotaPuntero referencia={referencia} />
    </>
  )
}
