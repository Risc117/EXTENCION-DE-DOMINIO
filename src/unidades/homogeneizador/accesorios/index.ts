import type { DatosHomogeneizador } from '../esquema'
import { construirBaranda } from './baranda'
import { construirBocaAcceso } from './bocaAcceso'
import { construirCajasValvula } from './cajaValvula'
import { construirEscalera } from './escalera'
import { construirTerreno } from './terreno'
import type { PiezaAccesorio } from './tipos'
import { construirVentilacion } from './ventilacion'

/** Todos los accesorios del plano como piezas simples, armadas con las medidas del JSON. */
export function construirAccesorios(d: DatosHomogeneizador): PiezaAccesorio[] {
  return [
    ...construirBaranda(d),
    ...construirBocaAcceso(d),
    ...construirEscalera(d),
    ...construirVentilacion(d),
    ...construirCajasValvula(d),
    ...construirTerreno(d),
  ]
}
