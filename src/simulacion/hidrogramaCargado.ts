import crudo from '../../datos/hidrograma.json'
import { crearHidrograma } from './hidrograma'

/** El hidrograma de datos/hidrograma.json ya validado; lo comparten el reloj y la demo. */
export const hidrograma = crearHidrograma(crudo)
