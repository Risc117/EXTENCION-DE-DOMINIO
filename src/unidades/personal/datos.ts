import rutasCrudas from '../../../datos/rutas.json'
import { esquemaRutas } from './esquema'

/** Rutas de técnicos y vehículos, vigilante y barrera ya validados (datos/rutas.json). */
export const rutas = esquemaRutas.parse(rutasCrudas)
