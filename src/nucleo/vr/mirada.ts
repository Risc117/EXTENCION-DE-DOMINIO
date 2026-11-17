type Vec3 = [number, number, number]

/** Lo que recordamos de la mira: qué se mira, cuánto lleva y si ya actuó sobre eso. */
export interface EstadoMirada {
  clave: string | null
  tiempo: number
  disparado: boolean
}

export const MIRADA_INICIAL: EstadoMirada = { clave: null, tiempo: 0, disparado: false }

export interface ResultadoMirada {
  estado: EstadoMirada
  /** Avance (0 a 1) hacia actuar. */
  progreso: number
  /** true en el cuadro en que se actúa (una sola vez por mirada). */
  disparar: boolean
}

/**
 * Mira central: mantener la mirada `umbral` segundos sobre lo mismo actúa una vez; cambiar de objetivo o mirar a nada reinicia.
 * `tocar` (el botón del visor) actúa en seguida sobre lo que se mira, cada vez que se toca. Función pura: el estado entra y sale.
 */
export function avanzarMirada(previo: EstadoMirada, clave: string | null, dt: number, umbral: number, tocar = false): ResultadoMirada {
  if (clave === null) return { estado: MIRADA_INICIAL, progreso: 0, disparar: false }
  const mismo = clave === previo.clave
  const tiempo = mismo ? previo.tiempo + dt : 0
  const yaActuo = mismo && previo.disparado
  const disparar = tocar || (!yaActuo && tiempo >= umbral)
  return { estado: { clave, tiempo, disparado: yaActuo || disparar }, progreso: Math.min(1, tiempo / umbral), disparar }
}

/**
 * Qué se está mirando: "salir" si la mirada baja más de `anguloSalir` grados bajo el horizonte; si no, una estructura ("unidad:id"),
 * el suelo (hay un punto) o nada. `direccion` es hacia dónde mira la cámara.
 */
export function claseDeMirada(direccion: Vec3, unidad: string | null, suelo: { x: number; z: number } | null, anguloSalir: number): string | null {
  const largo = Math.hypot(...direccion) || 1
  if (direccion[1] / largo < -Math.sin((anguloSalir * Math.PI) / 180)) return 'salir'
  if (unidad) return `unidad:${unidad}`
  return suelo ? 'suelo' : null
}
