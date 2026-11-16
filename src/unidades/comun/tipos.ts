import type { Vec3 } from './tiposAnotaciones'

export type { Vec3 }

/** Giro (rad) alrededor de z, centrado en un punto (x, y): sirve para fondos con pendiente. */
export interface Inclinacion {
  pivote: [number, number]
  angulo: number
}

interface Base {
  id: string
  /** Variable de color de src/ui/tokens.css (ej.: "--color-muro"). */
  color: string
  /** Caja y cilindro: centro. Anillo: centro de la base. */
  pos: Vec3
  opacidad?: number
  /** true = se oculta con el interruptor de accesorios. */
  accesorio?: boolean
  /** Giros (rad) alrededor de X, de Y y de Z (se usa uno solo por pieza). */
  giroX?: number
  giroY?: number
  giroZ?: number
  /** La pieza va dentro de un grupo inclinado (fondo con pendiente). */
  inclinacion?: Inclinacion
}

export interface PiezaCaja extends Base {
  forma: 'caja'
  /** Largo en x, alto en y, ancho en z (m). */
  tam: Vec3
}

export interface PiezaCilindro extends Base {
  forma: 'cilindro'
  radio: number
  alto: number
  /** 'x' o 'z' = acostado a lo largo de ese eje (tubería horizontal); 'y' = parado. */
  eje?: 'x' | 'y' | 'z'
}

export interface PiezaAnillo extends Base {
  forma: 'anillo'
  radioInterior: number
  radioExterior: number
  alto: number
}

/** Prisma de sección trapecio (tolvas): corre `largo` a lo largo de x. `pos` es su centro. */
export interface PiezaPrisma extends Base {
  forma: 'prisma'
  largo: number
  /** Ancho (z) arriba y abajo, y alto (y). */
  anchoSuperior: number
  anchoInferior: number
  alto: number
}

export type Pieza = PiezaCaja | PiezaCilindro | PiezaAnillo | PiezaPrisma

/** Masa de agua que crece desde `y0` hasta `y0 + nivel`. */
export type Agua =
  | { forma: 'caja'; id: string; centro: [number, number]; largo: number; ancho: number; y0: number; nivel: number; inclinacion?: Inclinacion }
  | { forma: 'cilindro'; id: string; centro: [number, number]; radio: number; y0: number; nivel: number }
  /** Planta de trapecio (canal que se angosta o ensancha), centrada en z = 0, entre x0 y x1. */
  | { forma: 'cuna'; id: string; x0: number; x1: number; ancho0: number; ancho1: number; y0: number; nivel: number }
