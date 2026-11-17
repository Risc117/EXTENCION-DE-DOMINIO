/** Etiquetas de toda la planta (T25): umbrales del zoom (fracción de la distancia inicial de la cámara), margen anti-parpadeo y largo de la flecha (fracción de la distancia de la cámara, y sus límites en m). */
export const UMBRAL_ETIQUETAS_LEJOS = 0.85
export const UMBRAL_ETIQUETAS_CERCA = 0.35
export const MARGEN_NIVEL_ETIQUETAS = 1.1
export const FRACCION_FLECHA_PLANTA = 0.05
export const FLECHA_PLANTA_MINIMA = 4
export const FLECHA_PLANTA_MAXIMA = 40
/** Escalones de altura de las etiquetas de planta (T35): cada etiqueta sube un escalón más que la anterior y vuelve a empezar, para que los textos de estructuras vecinas no se encimen; cada escalón suma esta fracción del largo de la flecha. */
export const ESCALONES_ETIQUETAS = 5
export const FRACCION_ESCALON_ETIQUETAS = 0.55
/** Etiquetas de toda la planta: paso (m) con el que se redondea la distancia de la cámara. */
export const PASO_DISTANCIA_ETIQUETAS = 10
