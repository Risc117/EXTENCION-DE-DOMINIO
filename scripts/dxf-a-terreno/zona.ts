import type { ZonaPlanta } from './leerPlano.ts'

/** Rectángulo UTM donde está la planta sobre el terreno (dentro de ZAPATITODECOTAS.dxf); ignora las copias del norte y los detalles. */
export const ZONA_PLANTA: ZonaPlanta = { este: [309250, 309500], norte: [8791100, 8791400] }
