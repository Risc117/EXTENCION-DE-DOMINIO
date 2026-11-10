import {
  ANGULO_REBOSE,
  ESPESOR_ZONA_MEZCLA,
  LARGO_BAJADA_REBOSE,
  PROLONGACION_INTERIOR_TUBO,
  PROLONGACION_TUBO,
  RADIO_RIEL,
} from '../../nucleo/constantes'
import type { DatosHomogeneizador } from './esquema'

type Vec3 = [number, number, number]

export type TipoPieza =
  | 'solado'
  | 'losa-fondo'
  | 'muro'
  | 'losa-techo'
  | 'ingreso'
  | 'salida'
  | 'rebose'
  | 'agitador'
  | 'riel'
  | 'zona-mezcla'

export type Pieza =
  | { id: string; tipo: TipoPieza; forma: 'cilindro'; posicion: Vec3; radio: number; largo: number; rotacion: Vec3 }
  /** Anillo vertical: su base está en `posicion` y sube `alto` metros. */
  | { id: string; tipo: TipoPieza; forma: 'anillo'; posicion: Vec3; radioInterior: number; radioExterior: number; alto: number }

const SIN_GIRO: Vec3 = [0, 0, 0]

/**
 * Convierte las medidas del JSON en piezas 3D (metros, Y hacia arriba).
 * El centro del tanque está en x=0, z=0; y=0 es el fondo útil (sobre la losa de fondo).
 * El ingreso y el rebose van del lado oeste (-x) y la salida en el este (+x).
 */
export function construirPiezas(d: DatosHomogeneizador): Pieza[] {
  const t = d.tanque
  const radioInt = t.diametroInterior.valor / 2
  const radioExt = t.diametroExterior.valor / 2
  const e = t.espesorMuro.valor
  const alto = t.alturaTotal.valor
  const eFondo = t.espesorLosaFondo.valor
  const eSolado = t.espesorSolado.valor
  const eTecho = t.espesorLosaTecho.valor

  const disco = (id: string, tipo: TipoPieza, y: number, radio: number, espesor: number): Pieza => ({
    id, tipo, forma: 'cilindro', posicion: [0, y, 0], radio, largo: espesor, rotacion: SIN_GIRO,
  })

  const piezas: Pieza[] = [
    disco('solado', 'solado', -eFondo - eSolado / 2, radioExt, eSolado),
    disco('losa-fondo', 'losa-fondo', -eFondo / 2, radioExt, eFondo),
    { id: 'muro', tipo: 'muro', forma: 'anillo', posicion: [0, 0, 0], radioInterior: radioInt, radioExterior: radioExt, alto },
    disco('losa-techo', 'losa-techo', alto + eTecho / 2, radioExt, eTecho),
  ]

  // Tubo horizontal que atraviesa el muro. `fi` es la dirección sobre el muro (0 = +x).
  const tuboMuro = (id: string, tipo: TipoPieza, fi: number, diametro: number, altura: number): Pieza => {
    const largo = PROLONGACION_INTERIOR_TUBO + e + PROLONGACION_TUBO
    const centro = radioInt - PROLONGACION_INTERIOR_TUBO + largo / 2
    return {
      id, tipo, forma: 'cilindro', radio: diametro / 2, largo,
      posicion: [centro * Math.cos(fi), altura, centro * Math.sin(fi)],
      rotacion: [0, -fi, Math.PI / 2],
    }
  }
  piezas.push(tuboMuro('ingreso', 'ingreso', Math.PI, d.ingreso.diametro.valor, d.ingreso.altura.valor))
  piezas.push(tuboMuro('salida', 'salida', 0, d.salida.diametro.valor, d.salida.altura.valor))

  // Rebose: tramo horizontal, codo de 90° afuera del muro y bajada vertical.
  const fiRebose = Math.PI - ANGULO_REBOSE
  const dRebose = d.rebose.diametro.valor
  const hRebose = d.rebose.altura.valor
  const radioCodo = radioExt + PROLONGACION_TUBO
  piezas.push(tuboMuro('rebose-horizontal', 'rebose', fiRebose, dRebose, hRebose))
  piezas.push({
    id: 'rebose-bajada', tipo: 'rebose', forma: 'cilindro', radio: dRebose / 2, largo: LARGO_BAJADA_REBOSE,
    posicion: [radioCodo * Math.cos(fiRebose), hRebose - LARGO_BAJADA_REBOSE / 2, radioCodo * Math.sin(fiRebose)],
    rotacion: SIN_GIRO,
  })

  // Agitador sumergible al centro: cuerpo, riel guía hasta arriba y zona de mezcla en el fondo.
  const a = d.agitador
  const alturaCuerpo = a.alturaImpulsor.valor
  const topeCuerpo = alturaCuerpo + a.altoCuerpo.valor / 2
  piezas.push({
    id: 'agitador', tipo: 'agitador', forma: 'cilindro', posicion: [0, alturaCuerpo, 0],
    radio: a.diametroCuerpo.valor / 2, largo: a.altoCuerpo.valor, rotacion: SIN_GIRO,
  })
  piezas.push({
    id: 'riel', tipo: 'riel', forma: 'cilindro', posicion: [0, (topeCuerpo + alto) / 2, 0],
    radio: RADIO_RIEL, largo: alto - topeCuerpo, rotacion: SIN_GIRO,
  })
  piezas.push(disco('zona-mezcla', 'zona-mezcla', ESPESOR_ZONA_MEZCLA / 2, a.diametroZonaMezcla.valor / 2, ESPESOR_ZONA_MEZCLA))
  return piezas
}
