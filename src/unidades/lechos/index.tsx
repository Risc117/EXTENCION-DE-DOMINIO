import crudo from '../../../datos/lechos.json'
import { todasLasMedidas } from '../comun/medidas'
import type { UnidadBase } from '../tipos'
import { disponer } from './disposicion'
import { esquemaLechos } from './esquema'
import { largoExterior } from './hidraulica'
import { Lechos } from './Lechos'

const datos = esquemaLechos.parse(crudo)

/** Lecho(s) de secado (id y lugar en planta.json: "lechos-secado"). */
export const unidadLechos: UnidadBase = {
  id: 'lechos-secado',
  nombre: 'Lechos de secado',
  demo: todasLasMedidas(datos).some((m) => m.demo === true),
  tamano: Math.max(disponer(datos).anchoConjunto, largoExterior(datos)),
  Componente: () => <Lechos datos={datos} />,
}
