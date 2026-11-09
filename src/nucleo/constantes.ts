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
