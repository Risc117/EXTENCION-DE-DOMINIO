/** Viento (T23): puntos de la rosa de los vientos, grados por punto, efecto en la llama (° por m/s y tope) y en los árboles (rad por m/s, tope y frecuencia en Hz), y velocidad (m/s) con la que la manga queda horizontal. */
export const NOMBRES_ROSA = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'] as const
export const GRADOS_POR_PUNTO_ROSA = 22.5
export const LLAMA_GRADOS_POR_MS = 10
export const LLAMA_INCLINACION_MAXIMA = 60
export const ARBOL_RAD_POR_MS = 0.012
export const ARBOL_BALANCEO_MAXIMO = 0.12
export const ARBOL_FRECUENCIA = 0.35
export const VELOCIDAD_MANGA_HORIZONTAL = 6
export const GRADOS_MEDIA_VUELTA = 180
export const GRADOS_VUELTA = 360
export const GRADOS_ANGULO_RECTO = 90
export const PUBLICACION_VIENTO_S = 0.2
/** Árboles: fracción del balanceo máximo que queda como inclinación fija con el viento, y avance de fase entre árboles vecinos (número áureo, para que no se muevan juntos). */
export const ARBOL_INCLINACION_FIJA = 0.5
export const FASE_ARBOL = 0.618
/** Indicador de viento: radio y mitad del lado (unidades del dibujo) de la rosa. */
export const RADIO_ROSA = 22
export const VISTA_ROSA = 30
