/** Aspecto y conversiones de la zona de desinfección (T14): solo estético; las medidas de diseño van en datos/desinfeccion.json. */

export const MILILITROS_POR_LITRO = 1000
export const SEGUNDOS_POR_MINUTO_DESINFECCION = 60
export const MM_POR_M_DESINFECCION = 1000
/** Milímetros por pulgada y denominador con que se escribe la fracción de pulgada de la línea de cloro. */
export const MM_POR_PULGADA = 25.4
export const DIECISEISAVOS = 16

/** Fracción de la prolongación de la tubería de entrada (desde su extremo) donde está el punto de aplicación del cloro. */
export const FRACCION_PUNTO_APLICACION = 0.55
/** Radio (m) del tanque de solución respecto de la pared de la caseta: separación del rincón (m). */
export const SEPARACION_RINCON_CASETA = 0.25
/** Cuánto sobresale (m) la línea de 1/2" fuera de la pared de la caseta. */
export const SOBRESALE_LINEA_CASETA = 0.8

/** Etiquetas de la cámara: desfases [x, y, z] (m) del texto respecto de su punta. */
export const DESFASES_ET_CONTACTO: Record<string, [number, number, number]> = {
  muros: [0, 1.6, -1.8],
  losa: [0, -1.2, 1.8],
  tabique: [0.8, 1.4, 1.4],
  pantalla: [1.2, 1.8, 0.8],
  entrada: [-1.4, 1.2, 1.2],
  salida: [-1.4, 1.2, -1.2],
  aplicacion: [-1.4, 2, 0],
  mezclador: [-0.6, 1, 1.4],
  retencion: [-1.6, 1.2, -0.2],
  trHoja: [0, 3.6, 0],
  trPlano: [0, 4.4, 0],
  nivel: [0, 5.2, 0],
}

/** Etiquetas de la caseta. */
export const DESFASES_ET_CASETA_CLORO: Record<string, [number, number, number]> = {
  tanque: [-0.6, 1.4, 0.6],
  bomba: [1.2, 1.4, 0],
  linea: [0.6, 1.4, 0.8],
  caseta: [0, 1.8, 0],
  dosis: [0, 2.6, 0],
}
