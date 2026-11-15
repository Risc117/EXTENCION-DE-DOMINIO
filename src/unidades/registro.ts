import { unidadHomogeneizador } from './homogeneizador'
import { crearMarcadores } from './marcador'
import { planta } from './planta'
import type { Unidad } from './tipos'
import { ubicar } from './ubicar'

/**
 * Lista de unidades de la PTAR, ya puestas en su lugar según datos/planta.json.
 * Para agregar una unidad real, súmala a `reales` (y quítale el marcador en planta.json).
 */
const reales = [unidadHomogeneizador]

export const unidades: Unidad[] = ubicar([...reales, ...crearMarcadores(planta)], planta)
