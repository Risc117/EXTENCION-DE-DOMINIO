import crudo from '../../../datos/entorno.json'
import { esquemaEntorno } from './esquema'

/** Entorno de la planta ya validado (datos/entorno.json). */
export const entorno = esquemaEntorno.parse(crudo)
