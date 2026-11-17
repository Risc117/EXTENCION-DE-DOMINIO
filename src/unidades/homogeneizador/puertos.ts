import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import type { DatosHomogeneizador } from './esquema'

const aRadianes = (grados: number): number => (grados * Math.PI) / 180

/**
 * Dirección sobre el muro (rad, ejes de geometria.ts: 0 = +x, z hacia el sur) de un tubo cuyo ángulo viene en grados
 * antihorarios desde el este vistos en planta (norte arriba): el eje z de la escena apunta al sur, así que el signo se invierte.
 */
export const direccionPuerto = (angulo: number): number => -aRadianes(angulo)

/** Puntos [x, z] (m, locales del tanque) donde terminan los tubos de entrada y de salida: a 1.5 m de la cara exterior del muro. */
export function puertos(d: DatosHomogeneizador): { ingreso: { fin: [number, number]; direccion: number }; salida: { fin: [number, number]; direccion: number } } {
  const r = d.tanque.diametroExterior.valor / 2 + PROLONGACION_TUBO
  const [fiIngreso, fiSalida] = [direccionPuerto(d.ingreso.angulo.valor), direccionPuerto(d.salida.angulo.valor)]
  return {
    ingreso: { fin: [r * Math.cos(fiIngreso), r * Math.sin(fiIngreso)], direccion: fiIngreso },
    salida: { fin: [r * Math.cos(fiSalida), r * Math.sin(fiSalida)], direccion: fiSalida },
  }
}
