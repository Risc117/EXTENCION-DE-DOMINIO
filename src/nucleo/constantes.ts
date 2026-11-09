/** Largo (m) que el tubo de ingreso y de salida sobresale del muro. */
export const PROLONGACION_TUBO = 1.5

/** Lados del cilindro que dibuja tubos y difusores. */
export const SEGMENTOS_CILINDRO = 32

/** Cámara inicial, como múltiplo del lado mayor del tanque. */
export const DISTANCIA_CAMARA = 1.8

/** Límites del zoom, como múltiplo del lado mayor del tanque. */
export const ZOOM_MINIMO = 0.5
export const ZOOM_MAXIMO = 4

/** Etiqueta que se muestra cuando hay datos de ejemplo. */
export const TEXTO_DATO_EJEMPLO = 'Dato de ejemplo'

/** Cámara: campo de visión (grados) y planos de recorte. */
export const CAMARA_FOV = 50
export const CAMARA_NEAR = 0.1
/** Plano lejano, como múltiplo del lado mayor del tanque. */
export const CAMARA_FAR_FACTOR = 20
/** Altura inicial de la cámara respecto de su distancia horizontal. */
export const CAMARA_ALTURA_FACTOR = 0.7
/** Punto al que mira la cámara (metros). */
export const OBJETIVO_CAMARA: [number, number, number] = [0, 1, 0]

/** Luces: intensidades y altura de la luz direccional (múltiplo del lado mayor). */
export const LUZ_AMBIENTE = 0.6
export const LUZ_DIRECCIONAL = 1.4
export const LUZ_ALTURA_FACTOR = 2
