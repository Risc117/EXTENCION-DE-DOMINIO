import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import type { DatosHomogeneizador } from './esquema'

const aRadianes = (grados: number): number => (grados * Math.PI) / 180

/**
 * Dirección sobre el muro (rad, ejes de geometria.ts: 0 = +x, z hacia el sur) de un tubo cuyo ángulo viene en grados
 * antihorarios desde el este vistos en planta (norte arriba): el eje z de la escena apunta al sur, así que el signo se invierte.
 */
export const direccionPuerto = (angulo: number): number => -aRadianes(angulo)

/** Puntos [x, z] (m, locales del tanque) donde terminan los tubos de entrada (pie del tubo vertical) y de salida (extremo del tubo). */
export function puertos(d: DatosHomogeneizador): { ingreso: { pie: [number, number]; direccion: number }; salida: { fin: [number, number]; direccion: number } } {
  const radioExt = d.tanque.diametroExterior.valor / 2
  const [fiIngreso, fiSalida] = [direccionPuerto(d.ingreso.angulo.valor), direccionPuerto(d.salida.angulo.valor)]
  const rIngreso = radioExt + d.ingreso.distanciaRiser.valor
  const rSalida = radioExt + PROLONGACION_TUBO
  return {
    ingreso: { pie: [rIngreso * Math.cos(fiIngreso), rIngreso * Math.sin(fiIngreso)], direccion: fiIngreso },
    salida: { fin: [rSalida * Math.cos(fiSalida), rSalida * Math.sin(fiSalida)], direccion: fiSalida },
  }
}
