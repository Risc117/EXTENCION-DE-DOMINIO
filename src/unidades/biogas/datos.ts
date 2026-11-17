import crudo from '../../../datos/biogas.json'
import { esquemaBiogas } from './esquema'

/** Antorcha y línea de biogás ya validadas (datos/biogas.json). */
export const biogas = esquemaBiogas.parse(crudo)
