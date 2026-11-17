/** Cuándo se muestran las cotas y etiquetas (T16.7): solo al acercarse a una estructura. */

/** Se encienden cuando la cámara está a menos de este múltiplo del tamaño de la unidad (al volar a una unidad la cámara queda a ≈ 2.84 veces su tamaño). */
export const DISTANCIA_ANOTACIONES = 4
/** Una vez encendidas se apagan un poco más lejos (múltiplo de la distancia anterior), para que no parpadeen en el borde. */
export const HISTERESIS_ANOTACIONES = 1.15
/** Las etiquetas de las tuberías (no pertenecen a una unidad) salen a menos de esta distancia (m) de la cámara. */
export const DISTANCIA_ETIQUETA_TUBERIA = 30
/** Tamaño (m) que se supone a una unidad que no dice el suyo. */
export const TAMANO_UNIDAD_SUPUESTO = 10
