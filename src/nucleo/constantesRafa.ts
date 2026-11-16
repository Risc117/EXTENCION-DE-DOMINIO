/** Aspecto y modelo de ejemplo del RAFA (T11): solo estético o modelo supuesto, no son medidas de diseño. */
/** RAFA: exponente del vertedero de las canaletas (lámina ∝ Q^(2/3)); modelo de ejemplo del nivel del agua (T11). */
export const EXPONENTE_VERTEDERO_RAFA = 2 / 3
/** RAFA: aspecto de los elementos que el plano no mide (solo estético). */
export const RADIO_RAMAL_RAFA = 0.04
export const LARGO_RAMAL_RAFA = 0.3
export const ALTO_TAPA_RAFA = 0.05
export const GROSOR_BARANDA_RAFA = 0.05
export const SEPARACION_TOMAS_RAFA = 0.4
export const SEPARACION_CAJAS_RAFA = 0.5
export const LARGO_SALIDA_EFLUENTE_RAFA = 0.6
/** Altura (m) de los ramales sobre la base del anillo del colector, y parte (0 a 1) del ancho interior en que se reparten las salidas del efluente. */
export const ALTURA_RAMAL_RAFA = 0.05
export const REPARTO_SALIDAS_RAFA = 0.8

/** Etiquetas del RAFA: desfases [x, y, z] (m) del texto respecto de su punta. */
export const DESFASES_ET_RAFA: Record<string, [number, number, number]> = {
  cajaDistribucion: [0, 1.4, 0],
  colector: [0, 1.6, 0],
  sedimentacion: [0, 1.2, -1.5],
  digestor: [0, 0.6, 1.5],
  gases: [0, 1.6, 1.5],
  efluente: [0.8, 1.4, 0],
  tomas: [0, 1.2, -1.2],
  muestreo: [0, 2, -1],
  descarga: [0, 2, -1],
  nivel: [0, 1.2, 1.5],
  trHoja: [0, 1.6, 0],
  trPlano: [0, 2.6, 0],
}
/** Etiquetas del RAFA: dónde apunta la flecha (m): altura sobre la zona o el piso, separación del muro y corrimiento de la segunda etiqueta de TR. */
export const ALTURA_PUNTA_ZONA_RAFA = 0.9
export const ALTURA_PUNTA_DIGESTOR_RAFA = 2
export const ALTURA_PUNTA_MUESTREO_RAFA = 0.5
export const ALTURA_PUNTA_DESCARGA_RAFA = 0.4
export const SEPARACION_PUNTA_CAJAS_RAFA = 1
export const MARGEN_PUNTA_NIVEL_RAFA = 0.5
export const CORRIMIENTO_TR_PLANO_RAFA = 3
