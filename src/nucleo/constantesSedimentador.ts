/** Aspecto del sedimentador secundario y de la cámara de reparto (T13): solo estético; las medidas de diseño van en datos/*.json. */

/** Espesor (m) de la pared de la cámara central, grosor del eje del puente, espesor de la pasarela y holgura (m) del agua dentro de la tolva. */
export const ESPESOR_PARED_CAMARA_CENTRAL = 0.02
export const RADIO_EJE_PUENTE = 0.05
export const ESPESOR_PASARELA = 0.05
export const HOLGURA_AGUA_TOLVA = 0.01
/** Cuánto sobresale (m) la pasarela del borde exterior del canal. */
export const SOBRESALIDO_PASARELA = 0.3

/** Etiquetas: desfases [x, y, z] (m) del texto respecto de su punta. */
export const DESFASES_ET_SEDIMENTADOR: Record<string, [number, number, number]> = {
  muro: [1.2, 1.4, 0],
  tolva: [-1.5, -0.4, 1.2],
  canal: [1.2, 1.6, 0],
  vertedero: [0, 1.8, 1.4],
  camaraCentral: [0, 2.4, -1.4],
  deflector: [1.4, -1, 0],
  alimentacion: [-1.2, -1, 1.2],
  purga: [1.2, -1, 1.2],
  salida: [1.4, 1.4, 0],
  puente: [0, 2.2, 1.2],
  pasarela: [1, 2.4, 0],
  mampara: [-1.2, 1.4, 0],
  escalera: [1.2, 1.4, 0],
  lodo: [-1.4, 0.6, 0],
  caudal: [0, 3.4, 0],
  trHoja: [0, 4.4, 0],
  trPlano: [0, 5.4, 0],
  carga: [0, 6.4, 0],
  lamina: [1.4, 2.2, 0],
}
/** Etiquetas: separación (m) entre la punta de la flecha y la pieza que señala. */
export const SEPARACION_PUNTA_SEDIMENTADOR = 0.2
/** Pasa metros a milímetros (diámetros nominales DN). */
export const MM_POR_M_SEDIMENTADOR = 1000

/** Cámara de reparto: desfases de etiquetas [x, y, z] (m) y altura (m) de las cotas sobre la caja. */
export const DESFASES_ET_REPARTO: Record<string, [number, number, number]> = {
  nombre: [0, 1.6, 0],
  caudal: [0, 2.6, 0],
}
