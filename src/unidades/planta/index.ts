import crudo from '../../../datos/planta.json'
import { esquemaPlanta } from './esquema'

/** Plano general ya validado. */
export const planta = esquemaPlanta.parse(crudo)
