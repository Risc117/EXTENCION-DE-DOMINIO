import crudo from '../../../datos/rejas.json'
import { todasLasMedidas } from '../comun/medidas'
import type { UnidadBase } from '../tipos'
import { disponer } from './disposicion'
import { esquemaRejas } from './esquema'
import { Rejas } from './Rejas'

const datos = esquemaRejas.parse(crudo)

export const unidadRejas: UnidadBase = {
  id: datos.id,
  nombre: datos.nombre,
  demo: todasLasMedidas(datos).some((m) => m.demo === true),
  tamano: disponer(datos).largoTotal,
  Componente: () => <Rejas datos={datos} />,
}
