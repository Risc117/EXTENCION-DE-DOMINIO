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
  // El lado mayor: el largo del cuerpo; el ancho con la caja de distribución (oeste) y la cámara de efluente (este) es menor.
  tamano: Math.max(datos.cuerpo.largoExterior.valor, datos.cuerpo.anchoExterior.valor + datos.distribucion.caja.ancho.valor + datos.efluente.anchoCamara.valor),
  Componente: () => <Rafa datos={datos} />,
}
