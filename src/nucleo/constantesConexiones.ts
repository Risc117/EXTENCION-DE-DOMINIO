/** Aspecto de las tuberías de conexión (T16): solo estético; los diámetros, trazados y cotas van en datos/conexiones.json. */

/** Color (token de src/ui/tokens.css) de cada línea, según la leyenda del plano general: celeste agua residual, rojo efluente, naranja lodos. */
export const COLOR_LINEA = {
  'agua-residual': '--color-tub-residual',
  impulsion: '--color-tub-impulsion',
  efluente: '--color-tub-efluente',
  lodos: '--color-tub-lodos',
  cloro: '--color-tub-cloro',
} as const

export type LineaConexion = keyof typeof COLOR_LINEA

/** Nombre de cada línea en las etiquetas. */
export const NOMBRE_LINEA: Record<LineaConexion, string> = {
  'agua-residual': 'Agua residual',
  impulsion: 'Impulsión',
  efluente: 'Efluente',
  lodos: 'Lodos',
  cloro: 'Línea de cloro',
}

/** Radio mínimo (m) con que se dibuja un tubo, para que la línea de cloro de 1/2" se vea. */
export const RADIO_MINIMO_TUBO = 0.04
export const SEGMENTOS_TUBO = 8
export const MM_POR_M_CONEXIONES = 1000
/** Opacidad (0 a 1) de los tramos enterrados. */
export const OPACIDAD_ENTERRADO = 0.55
/** Tolerancia (m) para decir que un tramo está sobre el terreno, y paso (m) con que se mide el perfil. */
export const TOLERANCIA_ENTERRADO = 0.05
export const PASO_PERFIL = 0.5
/** Distancia máxima (m) entre el primer o último punto de un tramo y su buzón. */
export const TOLERANCIA_BUZON = 0.05
/** Flechas del sentido del flujo: largo mínimo (m), largo en radios del tubo y radio en radios del tubo. */
export const LARGO_MINIMO_FLECHA = 0.8
export const LARGO_FLECHA_RADIOS = 3
export const RADIO_FLECHA_RADIOS = 1.6
export const SEGMENTOS_BUZON = 16
/** Desfases [x, y, z] (m) de las etiquetas de los tramos y los buzones respecto de su punta. */
export const DESFASE_ET_TRAMO: [number, number, number] = [0, 1.6, 0]
export const DESFASE_ET_BUZON: [number, number, number] = [0, 1.2, 0]
