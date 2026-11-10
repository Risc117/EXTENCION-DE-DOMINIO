/** Largo (m) que el tubo de ingreso y de salida sobresale del muro. */
export const PROLONGACION_TUBO = 1.5
/** Largo (m) que el tubo de ingreso y de salida entra al tanque. */
export const PROLONGACION_INTERIOR_TUBO = 0.5
/** Largo (m) del tramo vertical del rebose después del codo de 90°. */
export const LARGO_BAJADA_REBOSE = 1
/** Ángulo (radianes) del rebose respecto del ingreso, medido sobre el muro. */
export const ANGULO_REBOSE = Math.PI / 6
/** Radio (m) del riel guía del agitador y espesor (m) del disco de la zona de mezcla. */
export const RADIO_RIEL = 0.03
export const ESPESOR_ZONA_MEZCLA = 0.02
/** Opacidad (0 a 1) del muro, la losa de techo y la zona de mezcla para ver el interior. */
export const OPACIDAD_MURO = 0.35
export const OPACIDAD_TECHO = 0.3
export const OPACIDAD_ZONA_MEZCLA = 0.3
/** Diferencia máxima (m) aceptada entre medidas del plano que deben cuadrar. */
export const TOLERANCIA_MEDIDAS = 0.005

/** Opacidad (0 a 1) del agua. */
export const OPACIDAD_AGUA = 0.55

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

/** Corte: el plano va de -1 a 1 (fracción del radio interior). */
export const CORTE_RANGO = { min: -1, max: 1, paso: 0.01 }
export const CORTE_INICIAL = 0

/** Lados del cilindro que dibuja tubos, losas y agitador. */
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

/** Cámara orbital: posición inicial (radianes y múltiplo del lado mayor). */
export const ACIMUT_INICIAL = Math.PI / 4
export const ELEVACION_INICIAL = Math.atan(CAMARA_ALTURA_FACTOR / Math.SQRT2)
export const DISTANCIA_INICIAL = DISTANCIA_CAMARA * Math.hypot(Math.SQRT2, CAMARA_ALTURA_FACTOR)
/** Límites de la elevación (radianes). */
export const ELEVACION_MINIMA = 0.05
export const ELEVACION_MAXIMA = 1.5
/** Rapidez con que la cámara alcanza su destino (1/segundos). */
export const AMORTIGUACION_CAMARA = 12

/** Mouse: radianes por píxel arrastrado y zoom por unidad de rueda. */
export const GIRO_MOUSE = 0.005
export const ZOOM_RUEDA = 0.001

/** Mano: ajustes por defecto y rango de cada deslizador (más suaves que antes). */
export const AJUSTE_GESTOS_DEFECTO = { giro: 2, zoom: 1, suavizado: 0.75, zonaMuerta: 0.004 }
/** Clave de localStorage donde se recuerda si el panel de ajuste quedó abierto. */
export const CLAVE_PANEL_AJUSTE = 'ptar.panelAjusteAbierto'
export const AJUSTE_GESTOS_RANGO = {
  /** Radianes por ancho de imagen. */
  giro: { min: 0.5, max: 6, paso: 0.1 },
  /** Zoom por cambio de pinza. */
  zoom: { min: 0.25, max: 4, paso: 0.05 },
  /** 0 = sin suavizado, 0.95 = muy suave. */
  suavizado: { min: 0, max: 0.95, paso: 0.01 },
  /** Movimiento mínimo por cuadro (fracción de la imagen) para que cuente. */
  zonaMuerta: { min: 0, max: 0.02, paso: 0.001 },
} as const
/** La zona muerta de la pinza es esta cantidad de veces la de la palma. */
export const RAZON_ZONA_MUERTA_PINZA = 5
/** Puño: la punta de cada dedo queda más cerca de la muñeca que su articulación media. */
export const UMBRAL_PUNO = 1
/** Cuadros seguidos con puño para considerar pausa. */
export const CUADROS_PUNO = 3

/** Modelo y motor WASM de la mano (copias locales en public/, de @mediapipe/tasks-vision) y tamaño de captura. */
export const RUTA_WASM_CARGADOR = '/mediapipe/vision_wasm_internal.js'
export const RUTA_WASM_BINARIO = '/mediapipe/vision_wasm_internal.wasm'
export const RUTA_MODELO_MANO = '/modelos/hand_landmarker.task'
export const CAMARA_ANCHO = 640
export const CAMARA_ALTO = 480
