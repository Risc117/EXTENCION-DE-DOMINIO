import crudo from '../../../datos/rafa.json'
import { todasLasMedidas } from '../comun/medidas'
import type { UnidadBase } from '../tipos'
import { esquemaRafa } from './esquema'
import { Rafa } from './Rafa'

const datos = esquemaRafa.parse(crudo)

export const unidadRafa: UnidadBase = {
  id: datos.id,
  nombre: datos.nombre,
  demo: todasLasMedidas(datos).some((m) => m.demo === true),
  // El lado mayor incluye la cámara de efluente que sobresale del muro este.
  tamano: datos.cuerpo.largoExterior.valor + datos.efluente.anchoCamara.valor,
  Componente: () => <Rafa datos={datos} />,
}
