/** Aspecto de la antorcha y de la línea de biogás (T20): solo estético; medidas y posiciones van en datos/biogas.json. */

export const SEGMENTOS_BIOGAS = 12
/** Perlas de la línea de biogás y su velocidad (m/s) al biogás de diseño; con más biogás van más rápido (hasta el doble). */
export const PERLAS_BIOGAS = 24
export const VELOCIDAD_PERLAS_BIOGAS = 1
/** Radio (m) de la llama exterior, y qué parte de su alto y de su radio tiene la interior. */
export const RADIO_LLAMA = 0.45
export const ALTO_LLAMA_INTERIOR = 0.6
export const RADIO_LLAMA_INTERIOR = 0.55
/** Parpadeo de la llama: amplitud y frecuencias (rad/s) de las dos ondas. */
export const PARPADEO_LLAMA = { amplitudes: [0.12, 0.08], frecuencias: [23, 37] } as const
/** Cuánto sube (m) el círculo del radio de seguridad sobre el terreno y cuánto baja el recinto bajo él. */
export const ELEVACION_RADIO_BIOGAS = 0.15
export const ENTERRADO_RECINTO = 0.3
export const SEGMENTOS_CIRCULO_BIOGAS = 64

/** Tope de la escala de la llama respecto de la de diseño, escala mínima (para no escalar a 0), opacidad de la llama exterior, tope (s) del tiempo entre cuadros de las perlas y su radio relativo al del tubo. */
export const ESCALA_MAXIMA_LLAMA = 2
export const ESCALA_MINIMA_LLAMA = 0.001
export const OPACIDAD_LLAMA = 0.85
export const TOPE_CUADRO_PERLAS_S = 0.1
export const RADIO_PERLA_RELATIVO = 1.4
/** Brillo de las perlas de biogás y grosor del círculo del radio de seguridad. */
export const INTENSIDAD_PERLA_BIOGAS = 0.5
export const GROSOR_RADIO_SEGURIDAD = 2
