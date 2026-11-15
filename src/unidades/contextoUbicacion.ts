import { createContext } from 'react'
import { SIN_UBICACION, type UbicacionEscena } from './ubicacion'

/** La escena lo llena para cada unidad; sirve a quien necesite coordenadas del mundo (corte, visibilidad). */
export const ContextoUbicacion = createContext<UbicacionEscena>(SIN_UBICACION)
