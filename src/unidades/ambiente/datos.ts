import crudo from '../../../datos/ambiente.json'
import { esquemaAmbiente } from './esquema'

/** Ubicación, fecha y luminarias ya validadas (datos/ambiente.json). */
export const ambiente = esquemaAmbiente.parse(crudo)
