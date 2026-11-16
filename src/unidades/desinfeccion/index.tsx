import crudo from '../../../datos/desinfeccion.json'
import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import { todasLasMedidas } from '../comun/medidas'
import type { UnidadBase } from '../tipos'
import { Caseta } from './Caseta'
import { CamaraContacto } from './CamaraContacto'
import { esquemaDesinfeccion } from './esquema'
import { largoTotal } from './hidraulica'

const datos = esquemaDesinfeccion.parse(crudo)
const hayEjemplo = todasLasMedidas(datos).some((m) => m.demo === true)

/** Cámara de contacto (id y lugar en planta.json: "camara-contacto"). */
export const unidadCamaraContacto: UnidadBase = {
  id: 'camara-contacto',
  nombre: 'Cámara de contacto',
  demo: hayEjemplo,
  // Con la tubería de entrada, que sobresale del muro.
  tamano: largoTotal(datos) + PROLONGACION_TUBO,
  Componente: () => <CamaraContacto datos={datos} />,
}

/** Caseta de cloración (id y lugar en planta.json: "caseta-cloracion"). */
export const unidadCaseta: UnidadBase = {
  id: 'caseta-cloracion',
  nombre: 'Caseta de cloración',
  demo: hayEjemplo,
  tamano: Math.max(datos.caseta.largo.valor, datos.caseta.ancho.valor),
  Componente: () => <Caseta datos={datos} />,
}
