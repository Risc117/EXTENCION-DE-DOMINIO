import crudo from '../../../datos/homogeneizador.json'
import type { Unidad } from '../tipos'
import { areaUtil } from './calculos'
import { esquemaHomogeneizador } from './esquema'
import { Homogeneizador } from './Homogeneizador'

const datos = esquemaHomogeneizador.parse(crudo)

export const unidadHomogeneizador: Unidad = {
  id: datos.id,
  nombre: datos.nombre,
  demo: datos.demo === true,
  tamano: datos.tanque.diametroExterior.valor,
  hidraulica: {
    area: areaUtil(datos),
    alturaUtil: datos.tanque.alturaUtil.valor,
    alturaTotal: datos.tanque.alturaTotal.valor,
    alturaEjeSalida: datos.salida.altura.valor,
    diametroSalida: datos.salida.diametro.valor,
  },
  Componente: () => <Homogeneizador datos={datos} />,
}
