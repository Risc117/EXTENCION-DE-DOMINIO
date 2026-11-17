/** Cotas y etiquetas con flechas, y el orden en que se dibujan. */

/** Cotas y etiquetas: decimales del valor que se muestra, y el ángulo (rad) donde se apoyan las flechas visibles desde la cámara inicial. */
export const DECIMALES_COTA = 2
export const ANGULO_ANCLA_VISIBLE = Math.PI / 3
/** Cotas: altura (m) sobre la losa de techo de la línea del diámetro y de la del espesor del muro. */
export const DESFASE_COTA_PLANTA = 1.4
export const DESFASE_COTA_ESPESOR = 0.3
/** Cotas verticales: distancia (m) del muro a la primera columna y entre columnas. */
export const DESFASE_COTA_LATERAL = 1
export const SEPARACION_COLUMNA_COTA = 1.3
/** Cotas horizontales: cuánto (m) se sube el texto sobre su línea para no taparla. */
export const SUBIDA_TEXTO_COTA = 0.25
/** Flechas: largo máximo y radio (m) del cono, lados del cono y grosor (px) de las líneas. */
export const LARGO_FLECHA = 0.35
export const RADIO_FLECHA = 0.08
export const SEGMENTOS_FLECHA = 8
export const GROSOR_LINEA_ANOTACION = 1.5
/** Las anotaciones se dibujan al final y por encima del tanque; el texto queda bajo los paneles (z-index). */
export const ORDEN_ANOTACIONES = 999
export const CAPA_TEXTO_ANOTACION: [number, number] = [0, 0]
/** Un segmento que roza el tanque menos que esto (fracción del recorrido) no cuenta como tapado. */
export const MARGEN_OCLUSION = 1e-6
