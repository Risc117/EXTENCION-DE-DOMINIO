/** Gotas y rayas de corriente del agua (T17.2): solo estético; las medidas de cada unidad vienen de sus datos/*.json. */

/** Gotas por punto de caída, radio (m), velocidad de caída (m/s) y lados de la esfera. */
export const GOTAS_POR_PUNTO = 3
export const RADIO_GOTA = 0.03
export const VELOCIDAD_GOTA = 2.5
export const SEGMENTOS_GOTA = 6
/** Gotas por brazo del percolador, y cuánto (m) sale hacia afuera del muro del tanque cada gota del vertedero. */
export const PUNTOS_POR_BRAZO = 6
export const SALIDA_VERTEDERO = 0.05
/** Rayas de corriente: largo (m) de un tramo de la textura, velocidad (m/s) al caudal promedio, límites del factor de caudal y elevación (m) sobre el agua. */
export const LARGO_PATRON_RAYAS = 0.6
export const VELOCIDAD_RAYAS = 0.35
export const FACTOR_RAYAS_MINIMO = 0.2
export const FACTOR_RAYAS_MAXIMO = 3
export const ELEVACION_RAYAS = 0.004
export const OPACIDAD_RAYAS = 0.55
/** Textura de las rayas: lado (px), número de rayas y grosor (px) de cada una. */
export const LADO_TEXTURA_RAYAS = 64
export const NUMERO_RAYAS = 6
export const GROSOR_RAYA = 2
/** Gotas: opacidad; rayas: tope (s) del tiempo entre cuadros. */
export const OPACIDAD_GOTA = 0.85
export const TOPE_CUADRO_RAYAS = 0.1
/** Desfase (0 a 1) entre una gota y la del punto vecino, y forma de las rayas de la textura: desplazamiento (px) entre rayas, largo relativo al lado y posición vertical media. */
export const DESFASE_ENTRE_PUNTOS = 0.37
export const DESPLAZAMIENTO_RAYA = 29
export const LARGO_RAYA_RELATIVO = 0.4
export const CENTRO_RAYA = 0.5
