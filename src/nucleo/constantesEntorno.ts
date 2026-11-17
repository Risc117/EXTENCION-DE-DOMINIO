/** Aspecto del entorno de la planta (T16.5): solo estético; medidas y posiciones van en datos/entorno.json. */

/** Cada cuántos metros se toma la altura del terreno al tender vías y cerco. */
export const PASO_ENTORNO = 1.5
/** Cuánto sube (m) la cinta de la vía sobre el terreno, para que no parpadee con él. */
export const ELEVACION_VIA = 0.06
/** Cuánto bajan (m) las paredes de un edificio bajo su piso, para que no floten sobre una ladera. */
export const ENTERRADO_BASE = 0.3
/** Puntos del círculo del radio de seguridad y lados de la rotonda. */
export const SEGMENTOS_CIRCULO = 64
/** Lados de la copa y del tronco de un árbol. */
export const SEGMENTOS_ARBOL = 8
/** Grosor (m) de la pluma de la barrera y de las hojas del portón; opacidad del cerco (malla). */
export const GROSOR_PLUMA = 0.12
export const GROSOR_PORTON = 0.08
export const OPACIDAD_CERCO = 0.35
/** Distancia (m) a la que salen los nombres de los edificios. */
export const DISTANCIA_ETIQUETA_ENTORNO = 40
/** Desfase [x, y, z] (m) de la etiqueta de un edificio sobre su techo. */
export const DESFASE_ET_EDIFICIO: [number, number, number] = [0, 2, 0]
/** Río (T16.5.2): cuánto sube (m) el agua sobre el terreno, largo (m) de un tramo de la textura de corriente y velocidad (m/s) con que corre. */
export const ELEVACION_RIO = 0.1
export const LARGO_PATRON_RIO = 6
export const VELOCIDAD_RIO = 1.2
/** Distancia máxima (m) entre las dos orillas de una franja; más allá no se unen (el camino es de ≈ 7 m, el río de ≈ 10 m). */
export const ANCHO_MAXIMO_FRANJA = 20
/** Tamaño (px) de la textura de agua y número de rayas de corriente. */
export const LADO_TEXTURA_RIO = 64
export const RAYAS_RIO = 7
