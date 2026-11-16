/** Aspecto del filtro percolador (T12): solo estético; las medidas de diseño van en datos/percolador.json. */

/** Espesor radial (m) de las ventanas de ventilación dibujadas sobre el muro. */
export const ESPESOR_VENTANA_PERCOLADOR = 0.05

/** Etiquetas: desfases [x, y, z] (m) del texto respecto de su punta. */
export const DESFASES_ET_PERCOLADOR: Record<string, [number, number, number]> = {
  muro: [0, 1.4, 1.5],
  lecho: [0, 2, 3],
  columna: [0, 2.4, -2.5],
  brazos: [0, 2, 3],
  entrada: [0, 2, 1.5],
  ventanas: [0, 1.6, 1.5],
  canal: [0, 1.4, 1.5],
  salida: [0.8, 2, 1.5],
  compuerta: [0.8, 1.6, -1.5],
  contacto: [0, 2.8, 0],
  carga: [0, 3.8, 0],
  volumenHoja: [0, 4.8, 0],
  volumenPlano: [0, 5.8, 0],
  lamina: [0, 1.2, 4],
}

/** Espesor (m) de la compuerta mural dibujada y margen (m) entre la punta de los brazos y el muro. */
export const ESPESOR_COMPUERTA_PERCOLADOR = 0.1
export const MARGEN_BRAZO_PERCOLADOR = 0.3

/** Etiquetas: separación (m) de la punta de la flecha respecto de la pieza (brazos desde la columna, entrada desde el muro, lámina desde el borde del lecho). */
export const SEPARACION_PUNTA_BRAZOS_PERCOLADOR = 2
export const SEPARACION_PUNTA_ENTRADA_PERCOLADOR = 1
export const SEPARACION_PUNTA_LAMINA_PERCOLADOR = 1

/** Pasa metros a milímetros (diámetros nominales DN). */
export const MM_POR_M_PERCOLADOR = 1000
