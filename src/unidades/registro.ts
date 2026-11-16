import { unidadBombeo } from './bombeo'
import { unidadCamaraContacto, unidadCaseta } from './desinfeccion'
import { unidadDesarenador } from './desarenador'
import { unidadHomogeneizador } from './homogeneizador'
import { unidadLechos } from './lechos'
import { crearMarcadores } from './marcador'
import { planta } from './planta'
import { unidadParshall } from './parshall'
import { unidadPercolador } from './percolador'
import { unidadRafa } from './rafa'
import { unidadRejas } from './rejas'
import { unidadReparto } from './reparto'
import { unidadSedimentador1, unidadSedimentador2 } from './sedimentador'
import type { Unidad } from './tipos'
import { ubicar } from './ubicar'

/**
 * Lista de unidades de la PTAR, ya puestas en su lugar según datos/planta.json.
 * Para agregar una unidad real, súmala a `reales` (y quítale el marcador en planta.json).
 */
const reales = [unidadBombeo, unidadRejas, unidadDesarenador, unidadParshall, unidadHomogeneizador, unidadRafa, unidadPercolador, unidadReparto, unidadSedimentador1, unidadSedimentador2, unidadCamaraContacto, unidadCaseta, unidadLechos]

export const unidades: Unidad[] = ubicar([...reales, ...crearMarcadores(planta)], planta)
