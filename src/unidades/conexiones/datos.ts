import crudo from '../../../datos/conexiones.json'
import { esquemaConexiones } from './esquema'

/** Conexiones ya validadas (datos/conexiones.json). */
export const conexiones = esquemaConexiones.parse(crudo)
