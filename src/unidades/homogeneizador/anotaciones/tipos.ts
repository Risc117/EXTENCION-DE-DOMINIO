export type Vec3 = [number, number, number]

/** Cota lista para dibujar: línea de `a` a `b`, líneas de extensión y el texto en `centro`. */
export interface CotaCalculada {
  id: string
  texto: string
  a: Vec3
  b: Vec3
  extensiones: [Vec3, Vec3][]
  centro: Vec3
}

/** Etiqueta lista para dibujar: el texto va en `origen` y la flecha termina en `punta` (la pieza). */
export interface EtiquetaCalculada {
  id: string
  texto: string
  origen: Vec3
  punta: Vec3
  /** true si la pieza está dentro del tanque (no se oculta por quedar detrás del muro). */
  interior: boolean
  prioridad: boolean
}
