/** Geometría y aspecto del tanque homogeneizador, sus accesorios y el agua (valores de ejemplo salvo los que dicen lo contrario). */

/** Largo (m) que el tubo de ingreso y de salida sobresale del muro. */
export const PROLONGACION_TUBO = 1.5
/** Largo (m) que el tubo de ingreso y de salida entra al tanque. */
export const PROLONGACION_INTERIOR_TUBO = 0.5
/** Fracción del tramo horizontal de la entrada (de la cara del muro al tubo vertical) donde van su válvula, su caja y su varilla. */
export const FRACCION_VALVULA_INGRESO = 0.5
/** Largo (m) del tramo vertical del rebose después del codo de 90°. */
export const LARGO_BAJADA_REBOSE = 1
/** Ángulo (radianes) del rebose respecto del ingreso, medido sobre el muro. */
export const ANGULO_REBOSE = Math.PI / 6
/** Radio (m) del riel guía del agitador y espesor (m) del disco de la zona de mezcla. */
export const RADIO_RIEL = 0.03
export const ESPESOR_ZONA_MEZCLA = 0.02
/** Opacidad (0 a 1) del muro del cárcamo y de la zona de mezcla para ver el interior. */
export const OPACIDAD_MURO = 0.35
export const OPACIDAD_ZONA_MEZCLA = 0.3
/** Diferencia máxima (m) aceptada entre medidas del plano que deben cuadrar. */
export const TOLERANCIA_MEDIDAS = 0.005
/** Opacidad (0 a 1) del agua. */
export const OPACIDAD_AGUA = 0.55
/** Lados del cilindro que dibuja tubos, losas y agitador. */
export const SEGMENTOS_CILINDRO = 32
/** Accesorios: opacidad (0 a 1) del terreno natural y del relleno compactado. */
export const OPACIDAD_TERRENO = 0.22
export const OPACIDAD_RELLENO = 0.3
/** Accesorios: la baranda lleva un pasamanos arriba y otro a esta fracción de su altura. */
export const FRACCION_RIEL_MEDIO = 0.5
/** Escalera marinera: radio (m) de los peldaños, de los rieles y de las barras de la jaula; grosor (m) de los aros. */
export const RADIO_PELDANO = 0.015
export const RADIO_RIEL_ESCALERA = 0.025
export const RADIO_BARRA_JAULA = 0.012
export const GROSOR_ARO_JAULA = 0.02
/** Cuánto (m) se acerca la jaula al muro más allá del eje de la escalera. */
export const HOLGURA_JAULA_MURO = 0.1
/** Válvula: su cuerpo es este múltiplo del diámetro del tubo. */
export const FACTOR_CUERPO_VALVULA = 1.6
