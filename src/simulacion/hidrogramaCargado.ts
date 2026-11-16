import crudo from '../../datos/hidrograma.json'
import escala from '../../datos/escalaCaudal.json'
import { crearHidrograma } from './hidrograma'

/** El hidrograma de datos/hidrograma.json escalado a un solo caudal de diseño (T9.5); lo comparten el reloj y la demo. */
export const hidrograma = crearHidrograma(crudo, escala)
