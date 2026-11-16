/** Aspecto de los accesorios de las estructuras del pretratamiento y el bombeo (solo estéticos: no son medidas de diseño). */

/** Pretratamiento y bombeo: opacidad de las paredes de los canales y del agua en canales (0 a 1). */
export const OPACIDAD_CANAL = 0.45
export const OPACIDAD_AGUA_CANAL = 0.7
/** Accesorios de los canales: altura (m) y grosor (m) de la baranda. */
export const ALTURA_BARANDA_CANAL = 0.9
export const GROSOR_BARANDA_CANAL = 0.04
/** Reloj de las bombas: paso máximo (s simulados) de cálculo del cárcamo. */
export const PASO_MAXIMO_CARCAMO = 10
/** Cotas de los canales: separación (m) de la línea de cota respecto de la pieza, y subida del texto. */
export const DESFASE_COTA_CANAL = 0.6
/** Redondeo del caudal (L/s) con el que se redibuja el agua de los canales: décimas. */
export const DECIMAS_CAUDAL = 10

/** Válvulas de la impulsión: largo, alto y semiancho de la caja (m), y dónde empiezan desde el eje de la caseta. */
export const VALVULA_LARGO = 0.3
export const VALVULA_SEMIALTO = 0.2
export const VALVULA_SEMIANCHO = 0.15
export const VALVULA_COMPUERTA_DESDE = 0.3
export const VALVULA_RETENCION_DESDE = 0.8

/** Baranda del cárcamo: separación (m) del muro, cantidad de postes y coseno del ángulo que deja abierto el lado de la caseta. */
export const SEPARACION_BARANDA_CARCAMO = 0.1
export const POSTES_BARANDA_CARCAMO = 12
export const COSENO_LADO_CASETA = 0.8

/** Regla de medición del Parshall: pegada a la pared, separada (m) de ella. */
export const SEPARACION_REGLA_PARSHALL = 0.01

/** Desfases (m) de los textos de las etiquetas respecto de su punta: [x, y, z]. */
export const DESFASE_ET_RECEPCION: [number, number, number] = [0, 1.4, 0]
export const DESFASE_ET_REJAS: [number, number, number] = [0, 1.9, 0]
export const DESFASE_ET_BYPASS: [number, number, number] = [0, 1.1, 0.6]
export const DESFASE_ET_CANAL: [number, number, number] = [0, 2, 0]
export const DESFASE_ET_TOLVA: [number, number, number] = [0, -0.9, -2.5]
export const DESFASE_ET_SUTRO: [number, number, number] = [1.2, 1.2, 0]
export const DESFASE_ET_TRANSICION: [number, number, number] = [0, 1.6, 0]
export const DESFASE_ET_CONVERGENTE: [number, number, number] = [0, 1.2, 1.5]
export const DESFASE_ET_DIVERGENTE: [number, number, number] = [0.8, 1.2, 1.5]
export const DESFASE_ET_MEDIDOR: [number, number, number] = [-0.4, 1.3, -1.2]
export const SUBIDA_PUNTA_MEDIDOR = 0.3
export const DESFASE_ET_CASETA: [number, number, number] = [0, 1.3, 0]
export const DESFASE_ET_IMPULSION: [number, number, number] = [0, 1.4, 0]
export const FRACCION_TRAMO_ET_IMPULSION = 0.7
export const DESFASE_ET_CARCAMO_X = -0.6
export const SUBIDA_ET_CARCAMO = 1.6
export const DESFASE_ET_BOMBA_X = -0.5
export const BAJADA_ET_BOMBA = 0.3
export const BAJADA_ET_BOMBA_RESERVA = 0.6
export const FACTOR_DESFASE_COTA_PARADA = 2.2
export const SUBIDA_PUNTA_ET_CANAL = 0.05
export const CORRIMIENTO_ET_TOLVA = 1
export const DESFASE_ET_GARGANTA: [number, number, number] = [0, 2, 0]
