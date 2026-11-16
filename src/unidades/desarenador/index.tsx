import crudo from '../../../datos/desarenador.json'
import { todasLasMedidas } from '../comun/medidas'
import type { UnidadBase } from '../tipos'
import { Desarenador } from './Desarenador'
import { disponer } from './disposicion'
import { esquemaDesarenador } from './esquema'

const datos = esquemaDesarenador.parse(crudo)

export const unidadDesarenador: UnidadBase = {
  id: datos.id,
  nombre: datos.nombre,
  demo: todasLasMedidas(datos).some((m) => m.demo === true),
  tamano: disponer(datos).largoTotal,
  Componente: () => <Desarenador datos={datos} />,
}
