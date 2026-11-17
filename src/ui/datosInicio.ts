import crudo from '../../datos/inicio.json'
import { esquemaInicio } from '../nucleo/inicioEsquema'

/** Datos de la pantalla de inicio ya validados (datos/inicio.json). */
export const inicio = esquemaInicio.parse(crudo)
