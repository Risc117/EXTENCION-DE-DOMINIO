import type { DatosHomogeneizador } from '../esquema'
import type { PiezaAccesorio, Vec3 } from './tipos'

export const SIN_GIRO: Vec3 = [0, 0, 0]
/** Gira un cilindro vertical para dejarlo acostado a lo largo de z. */
export const ACOSTADO_EN_Z: Vec3 = [Math.PI / 2, 0, 0]

/** Altura (m) de la cara de arriba de la losa de techo: también es el nivel del terreno. */
export const cotaTecho = (d: DatosHomogeneizador): number => d.tanque.alturaTotal.valor + d.tanque.espesorLosaTecho.valor

/** Posición (x) de los rieles de la escalera: pegada al muro del lado de la salida. */
export const xEscalera = (d: DatosHomogeneizador): number => d.tanque.diametroInterior.valor / 2 - d.accesorios.escalera.separacionMuro.valor

/** Cilindro vertical que va de `desde` a `hasta` (alturas, m). */
export const cilindroVertical = (
  id: string,
  tipo: PiezaAccesorio['tipo'],
  x: number,
  z: number,
  desde: number,
  hasta: number,
  radio: number,
): PiezaAccesorio => ({ id, tipo, forma: 'cilindro', posicion: [x, (desde + hasta) / 2, z], radio, largo: hasta - desde, rotacion: SIN_GIRO })
