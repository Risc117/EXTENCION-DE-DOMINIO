import crudo from '../../../datos/conexiones.json'
import { planta } from '../planta'
import { unidades } from '../registro'
import { cotaReferencia } from '../ubicar'
import { esquemaConexiones } from './esquema'

/** Ayudas comunes de las pruebas de las conexiones. */
export { crudo }
export const datos = esquemaConexiones.parse(crudo)
export const clon = () => structuredClone(crudo)
export const idsUnidades = planta.unidades.map((u) => u.id)
export const referencia = cotaReferencia(unidades)
export const unidad = (id: string) => unidades.find((u) => u.id === id)!
export const tramo = (id: string) => datos.tramos.find((t) => t.id === id)!
export const distancia = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)
