import crudo from '../../../datos/parshall.json'
import { todasLasMedidas } from '../comun/medidas'
import type { UnidadBase } from '../tipos'
import { disponer } from './disposicion'
import { esquemaParshall } from './esquema'
import { Parshall } from './Parshall'

const datos = esquemaParshall.parse(crudo)

export const unidadParshall: UnidadBase = {
  id: datos.id,
  nombre: datos.nombre,
  demo: todasLasMedidas(datos).some((m) => m.demo === true),
  tamano: disponer(datos).largoTotal,
  Componente: () => <Parshall datos={datos} />,
}
