import crudo from '../../../datos/bombeo.json'
import { todasLasMedidas } from '../comun/medidas'
import type { UnidadBase } from '../tipos'
import { Bombeo } from './Bombeo'
import { disponer } from './disposicion'
import { esquemaBombeo } from './esquema'

const datos = esquemaBombeo.parse(crudo)
const s = disponer(datos)

export const unidadBombeo: UnidadBase = {
  id: datos.id,
  nombre: datos.nombre,
  demo: todasLasMedidas(datos).some((m) => m.demo === true),
  tamano: s.largoTotal,
  bombeo: {
    area: Math.PI * s.radioInterior ** 2,
    nivelArranque: datos.niveles.arranque.valor,
    nivelParada: datos.niveles.parada.valor,
    caudalBomba: datos.bombas.caudal.valor,
    cantidad: datos.bombas.cantidad.valor,
  },
  Componente: () => <Bombeo datos={datos} />,
}
