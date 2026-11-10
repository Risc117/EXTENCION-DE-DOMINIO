export type Vec3 = [number, number, number]

export type TipoAccesorio =
  | 'baranda'
  | 'riel-baranda'
  | 'portillo'
  | 'brocal'
  | 'tapa'
  | 'escalera-riel'
  | 'peldano'
  | 'jaula'
  | 'ventilacion'
  | 'hongo'
  | 'caja-valvula'
  | 'varilla'
  | 'valvula'
  | 'relleno'
  | 'terreno'

interface Base {
  id: string
  tipo: TipoAccesorio
  posicion: Vec3
}

/** Piezas simples (metros, Y hacia arriba): `posicion` es el centro, salvo en el anillo, donde es la base. */
export type PiezaAccesorio =
  | (Base & { forma: 'caja'; tamano: Vec3; rotacion: Vec3 })
  | (Base & { forma: 'cilindro'; radio: number; largo: number; rotacion: Vec3 })
  /** Cono con la punta hacia arriba. */
  | (Base & { forma: 'cono'; radio: number; largo: number })
  | (Base & { forma: 'anillo'; radioInterior: number; radioExterior: number; alto: number })
