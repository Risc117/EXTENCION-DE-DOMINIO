import crudo from '../../../datos/sedimentador.json'
import lineaCruda from '../../../datos/linea.json'
import { esquemaSedimentador } from './esquema'
import { crearUnidadSedimentador } from './unidad'

const datos = esquemaSedimentador.parse(crudo)

/** Parte del caudal que la cámara de reparto manda a cada sedimentador (datos/linea.json). */
const reparto = (lineaCruda.nodos.find((n) => n.id === 'camara-reparto') as { destinos: { id: string; fraccion: number }[] }).destinos
const fraccionDe = (id: string): number => reparto.find((x) => x.id === id)?.fraccion ?? 0

export const unidadSedimentador1 = crearUnidadSedimentador(datos, 'sedimentador-1', 'Sedimentador 1', fraccionDe('sedimentador-1'))
export const unidadSedimentador2 = crearUnidadSedimentador(datos, 'sedimentador-2', 'Sedimentador 2', fraccionDe('sedimentador-2'))
