import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import { disponer } from './disposicion'
import type { DatosSedimentador } from './esquema'

/** Instancia que se arma si no se dice cuál (las pruebas de la geometría común). */
export const INSTANCIA_PRIMERA = 'sedimentador-1'

/** Dirección sobre el muro (rad, ejes de la escena: 0 = +x, z hacia el sur) de un tubo cuyo ángulo viene en grados antihorarios desde el este vistos en planta. */
export const direccionPuerto = (angulo: number): number => -(angulo * Math.PI) / 180

export type PuertosInstancia = DatosSedimentador['puertos'][string]

/** Ángulos de los tubos de una instancia; falla si el JSON no la trae. */
export function puertosDe(d: DatosSedimentador, id: string): PuertosInstancia {
  const p = d.puertos[id]
  if (!p) throw new Error(`datos/sedimentador.json no trae los puertos de "${id}"`)
  return p
}

/** Extremo exterior de cada tubo: punto [x, z] (m, locales: origen en el centro, x al este, z al sur) a 1.5 m del canal. */
export function extremos(d: DatosSedimentador, id: string): { entrada: [number, number]; salida: [number, number]; purga: [number, number] } {
  const r = disponer(d).radioCanalExterior + PROLONGACION_TUBO
  const p = puertosDe(d, id)
  const punto = (grados: number): [number, number] => [r * Math.cos(direccionPuerto(grados)), r * Math.sin(direccionPuerto(grados))]
  return { entrada: punto(p.entrada.valor), salida: punto(p.salida.valor), purga: punto(p.purga.valor) }
}
