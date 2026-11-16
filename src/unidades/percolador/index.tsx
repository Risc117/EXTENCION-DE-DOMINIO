import crudo from '../../../datos/percolador.json'
import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import { todasLasMedidas } from '../comun/medidas'
import type { UnidadBase } from '../tipos'
import { disponer } from './disposicion'
import { esquemaPercolador } from './esquema'
import { Percolador } from './Percolador'

const datos = esquemaPercolador.parse(crudo)
const s = disponer(datos)

export const unidadPercolador: UnidadBase = {
  id: datos.id,
  nombre: datos.nombre,
  demo: todasLasMedidas(datos).some((m) => m.demo === true),
  // Con la cámara de salida y su tubería, que sobresalen del muro este.
  tamano: 2 * s.radioExterior + datos.salida.ancho.valor + PROLONGACION_TUBO,
  Componente: () => <Percolador datos={datos} />,
}
