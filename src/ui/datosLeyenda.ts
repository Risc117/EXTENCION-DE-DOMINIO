import crudo from '../../datos/leyenda.json'
import { esquemaLeyenda } from '../nucleo/leyendaEsquema'

/** Leyenda ya validada (datos/leyenda.json). */
export const leyenda = esquemaLeyenda.parse(crudo)
