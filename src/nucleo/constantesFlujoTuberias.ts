/** Flujo ilustrativo en las tuberías (T17): solo estético; qué caudal mueve cada tramo va en datos/conexiones.json (`caudal`). */

/** Separación (m) entre perlas en calidad alta y en baja. */
export const SEPARACION_PERLAS = { alta: 1.2, baja: 2.4 } as const
/** Velocidad visual (m/s de la escena) con el caudal promedio del día, y sus topes. */
export const VELOCIDAD_PROMEDIO = 1.2
export const VELOCIDAD_MINIMA = 0.15
export const VELOCIDAD_MAXIMA = 3
/** Fracción del caudal promedio con que se mueven los lodos y el cloro (lentos y fijos). */
export const FRACCION_LENTA = 0.25
/** Radio de la perla en radios del tubo (algo mayor, para que se vea sobre el tubo). */
export const RADIO_PERLA_RADIOS = 1.3
export const SEGMENTOS_PERLA = 8
