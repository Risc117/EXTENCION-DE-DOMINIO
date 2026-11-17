export interface MedidorNivel {
  /** Parte del tanque llena (0 a 100 % de la altura total). */
  lleno: number
  /** Dónde cae la altura útil (0 a 100 % de la altura total). */
  marcaUtil: number
  /** true si el nivel pasa la altura útil. */
  sobreUtil: boolean
}

const porcentaje = (parte: number, total: number): number => (total > 0 ? Math.max(0, Math.min(100, (parte / total) * 100)) : 0)

/** La barra del nivel del tanque: cuánto está lleno y dónde queda la altura útil, sobre la altura total. */
export function medidorNivel(nivel: number, alturaUtil: number, alturaTotal: number): MedidorNivel {
  return { lleno: porcentaje(nivel, alturaTotal), marcaUtil: porcentaje(alturaUtil, alturaTotal), sobreUtil: nivel > alturaUtil }
}
