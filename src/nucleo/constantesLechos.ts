/** Aspecto y conversiones del lecho de secado (T15): solo estético; las medidas de diseño van en datos/lechos.json. */

/** Giro (rad) del grupo: el dren corre en el eje z al armar la pieza y en el plano general corre de este a oeste (eje x). */
export const GIRO_EJE_DREN = Math.PI / 2
export const CM_POR_M_LECHOS = 100
export const MM_POR_M_LECHOS = 1000
/** Tolerancia (m) entre medidas del plano que deben cuadrar entre sí. */
export const TOLERANCIA_LECHOS = 0.001
/** El nivel de lodo se redondea al centímetro para no rearmar la pieza en cada cuadro. */
export const PASOS_NIVEL_LODO = 100

/** Etiquetas: desfases [x, y, z] (m) del texto respecto de su punta. */
export const DESFASES_ET_LECHOS: Record<string, [number, number, number]> = {
  muros: [-1.2, 1.8, 0],
  dren: [0, 2.2, 3],
  tapas: [0, 2.8, -3],
  tubo: [1.4, 1.2, 0],
  piso: [-2, -1.2, 0],
  ladrillo: [2.5, 2.4, 3],
  arena: [2.5, 2, 4],
  gravaFina: [2.5, 1.6, 5],
  gravaMedia: [2.5, 1.2, 6],
  gravaGruesa: [2.5, 0.8, 7],
  lodo: [-2.5, 2.2, 3],
  ciclo: [0, 3.6, 0],
  area: [0, 4.4, 0],
  cantidad: [0, 5.2, 0],
}
