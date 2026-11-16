import crudo from '../../../datos/camaraReparto.json'
import { todasLasMedidas } from '../comun/medidas'
import type { UnidadBase } from '../tipos'
import { esquemaReparto } from './esquema'
import { Reparto } from './Reparto'

const datos = esquemaReparto.parse(crudo)

export const unidadReparto: UnidadBase = {
  id: datos.id,
  nombre: datos.nombre,
  demo: todasLasMedidas(datos).some((m) => m.demo === true),
  tamano: Math.max(datos.caja.largo.valor, datos.caja.ancho.valor),
  Componente: () => <Reparto datos={datos} />,
}
