import crudo from '../../../datos/homogeneizador.json'
import type { Unidad } from '../tipos'
import { esquemaHomogeneizador } from './esquema'
import { Homogeneizador } from './Homogeneizador'

const datos = esquemaHomogeneizador.parse(crudo)

export const unidadHomogeneizador: Unidad = {
  id: datos.id,
  nombre: datos.nombre,
  demo: datos.demo === true,
  tamano: Math.max(datos.tanque.largo.valor, datos.tanque.ancho.valor),
  Componente: () => <Homogeneizador datos={datos} />,
}
