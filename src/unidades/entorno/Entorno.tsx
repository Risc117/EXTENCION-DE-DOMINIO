import { useEntorno } from '../../estado/entorno'
import { Arboles } from './Arboles'
import { Cerco } from './Cerco'
import { Edificios } from './Edificios'
import { Puente } from './Puente'
import { Rio } from './Rio'
import { Suelos } from './Suelos'
import { VegetacionAlrededor } from './VegetacionAlrededor'

/** Entorno de la planta (T16.5): edificios, vías, cerco con portón y árboles, todo desde datos/entorno.json. El botón "Entorno" lo oculta. */
export function Entorno({ referencia }: { referencia: number }) {
  const visible = useEntorno((s) => s.visible)
  if (!visible) return null
  return (
    <group>
      <Suelos referencia={referencia} />
      <Rio referencia={referencia} />
      <Puente referencia={referencia} />
      <Edificios referencia={referencia} />
      <Cerco referencia={referencia} />
      <Arboles referencia={referencia} />
      <VegetacionAlrededor referencia={referencia} />
    </group>
  )
}
