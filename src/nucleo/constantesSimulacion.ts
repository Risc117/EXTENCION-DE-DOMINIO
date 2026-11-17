/** Simulación del nivel y del caudal, reloj, partículas del flujo y remolino (efecto ilustrativo). */

/** Simulación: gravedad (m/s²) y coeficiente de descarga Cd de la salida (DATO DE EJEMPLO, confirmar con el diseño). */
export const GRAVEDAD = 9.81
export const CD_SALIDA = 0.6
export const CD_SALIDA_ES_EJEMPLO = true
/** Conversiones de tiempo y volumen. */
export const HORAS_POR_DIA = 24
export const SEGUNDOS_POR_HORA = 3600
export const LITROS_POR_M3 = 1000
/** Reloj: velocidades (segundos simulados por segundo real) y la inicial. */
export const VELOCIDADES_SIMULACION = [1, 60, 600, 3600]
export const VELOCIDAD_INICIAL = 600
/** Paso máximo de cálculo (s simulados) y tope de tiempo real por cuadro (s) para no dar saltos. */
export const PASO_MAXIMO_SIMULACION = 60
export const TOPE_CUADRO_SEGUNDOS = 0.25
/** Rango del deslizador del caudal de salida (L/s) y su paso. */
export const SALIDA_AJUSTE_RANGO = { min: 0, max: 40, paso: 0.1 }
/** Partículas del flujo (efecto ilustrativo): cantidad según la calidad elegida; la alta es el tope del buffer. */
export const CALIDAD_PARTICULAS = { baja: 150, alta: 400 }
export const NUMERO_PARTICULAS = CALIDAD_PARTICULAS.alta
/** Clave de localStorage de la calidad, y ancho (px) bajo el cual la pantalla se considera chica. */
export const CLAVE_CALIDAD = 'ptar.calidad'
export const UMBRAL_PANTALLA_CHICA = 700
export const RADIO_PARTICULA = 0.05
/** Caudal (L/s) con el que las partículas van a velocidad normal, y tope del factor de velocidad. */
export const CAUDAL_REFERENCIA_LS = 13
export const FACTOR_VELOCIDAD_MAXIMO = 3
/** Velocidades normales (m/s) de caída del ingreso y de avance hacia la salida. */
export const VELOCIDAD_CAIDA = 2.5
export const VELOCIDAD_SALIDA_PARTICULA = 0.8
/** Tiempo (s) que una partícula da vueltas en la zona de mezcla: mínimo y máximo. */
export const DURACION_MEZCLA = { min: 6, max: 14 }
/** Giro del remolino (rad/s): mínimo y máximo por partícula. */
export const GIRO_REMOLINO = { min: 0.5, max: 1.2 }
/** Rapidez (1/s) con que la partícula se acerca a su radio y altura de mezcla. */
export const RELAJACION_MEZCLA = 1.5
/** Radio mínimo (m) de las vueltas, cerca del agitador. */
export const RADIO_MINIMO_REMOLINO = 0.4
/** Entre qué fracciones del nivel de agua dan vueltas las partículas. */
export const ALTURA_MEZCLA = { min: 0.1, max: 0.9 }
/** Espera máxima (s) antes de soltar una partícula, para que el chorro sea continuo. */
export const ESPERA_MAXIMA_PARTICULA = 12
/** Cuánto (m) se separa el chorro de la pared y su dispersión lateral (m). */
export const RETRANQUE_INGRESO = 0.3
export const DISPERSION_CHORRO = 0.1
/** Distancia (m) a la salida a la que la partícula sale del tanque. */
export const LLEGADA_SALIDA = 0.15
/** Bajo este nivel (m) no se dibujan partículas dentro del agua. */
export const NIVEL_MINIMO_VISIBLE = 0.05
/** Semilla del azar de las partículas (para que sea repetible). */
export const SEMILLA_PARTICULAS = 20260101
/** Espiral del remolino: vueltas, puntos, velocidad de giro (rad/s) y grosor de línea. */
export const ESPIRAL = { vueltas: 3, puntos: 120, giro: 0.6, grosor: 2 }
export const OPACIDAD_REMOLINO = 0.4
