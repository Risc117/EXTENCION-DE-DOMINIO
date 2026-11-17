/** Sol y luz del día (T22): inclinación máxima de la Tierra (°), umbral de altura del sol (°) bajo el que se encienden las luces, y rango (°) de la mezcla día-noche del cielo. */
export const INCLINACION_MAXIMA = 23.44
export const UMBRAL_LUCES = 0
export const CREPUSCULO = 12
/** Intensidad de la luz ambiente de noche y de día. */
export const AMBIENTE_NOCHE = 0.12
export const AMBIENTE_DIA = 0.55
/** Días de un año y de una vuelta del sol, grados por hora y hora del mediodía solar. */
export const DIAS_ANIO = 365
export const GRADOS_POR_HORA = 15
export const HORA_MEDIODIA = 12
/** Días de cada mes (año sin bisiesto). */
export const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const
/** Distancia (m) del sol al centro de la planta, semi-lado (m) de la caja de sombras, mapa de sombras (px) y número de estrellas por calidad. */
export const DISTANCIA_SOL = 400
export const SEMILADO_SOMBRAS = 160
export const MAPA_SOMBRAS = { alta: 2048, baja: 0 } as const
export const ESTRELLAS = { alta: 600, baja: 150 } as const
