/** Ambiente (T22): lámparas, estrellas, sol y sombras. */
export const BRILLO_LAMPARA = 2
export const OPACIDAD_CIRCULO_LUZ = 0.25
export const RADIO_LAMPARA_RELATIVO = 2.5
export const SEGMENTOS_LUMINARIA = 8
/** Estrellas: semilla fija, tamaño (px) y qué parte de la bóveda (0 a 1) del horizonte al cenit ocupan. */
export const SEMILLA_ESTRELLAS = 12345
export const TAMANO_ESTRELLA = 2
export const FRACCION_CIELO_ESTRELLAS = 1
/** Intensidad del sol a pleno día y sesgo (m) del mapa de sombras. */
export const LUZ_SOL = 1.6
export const SESGO_SOMBRA = -0.0005
/** Cada cuántos segundos se buscan mallas nuevas para darles sombra. */
export const INTERVALO_SOMBRAS_S = 1.5
/** Paso (horas) del deslizador de la hora del día. */
export const PASO_HORA_DESLIZADOR = 0.25
/** Parte de la distancia máxima de visión (far) a la que se ponen las estrellas, altura mínima del vector al sol (para que la luz no quede a ras del suelo) y altura (m) del círculo de luz sobre el suelo. */
export const FRACCION_FAR_ESTRELLAS = 0.9
export const ELEVACION_MINIMA_LUZ_SOL = 0.02
export const ALTURA_CIRCULO_LUZ = 0.05
/** Generador pseudoaleatorio de las estrellas (congruencial lineal): multiplicador, incremento y módulo. */
export const GENERADOR_ESTRELLAS = { multiplicador: 1664525, incremento: 1013904223, modulo: 4294967296 } as const
/** Sombras: plano cercano (m) y factor de la distancia del sol para el plano lejano. */
export const CERCA_SOMBRAS = 1
export const FACTOR_LEJOS_SOMBRAS = 3
/** Lados del círculo de luz de una luminaria, minutos de una hora y cifras de la hora y los minutos del reloj. */
export const SEGMENTOS_CIRCULO_LUZ = 24
export const MINUTOS_POR_HORA = 60
export const CIFRAS_RELOJ = 2
/** Manga de viento: lados del cono. */
export const SEGMENTOS_MANGA = 12
/** Hora (0 a 24) en la que arranca el reloj al abrir, al reiniciar y al elegir un día: de mañana, para que el visor abra de día (T35). No es un dato de la planta. */
export const HORA_INICIAL_SIMULACION = 8
/** Franja de día y noche bajo el deslizador de la hora (T35): en cuántos tramos se reparte el día. */
export const TRAMOS_FRANJA_DIA = 48
