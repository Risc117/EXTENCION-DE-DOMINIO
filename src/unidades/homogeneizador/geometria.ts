import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import type { DatosHomogeneizador } from './esquema'

type Vec3 = [number, number, number]

export type TipoPieza = 'piso' | 'muro' | 'ingreso' | 'salida' | 'difusor'

export type Pieza =
  | { id: string; tipo: TipoPieza; forma: 'caja'; posicion: Vec3; tamano: Vec3 }
  | { id: string; tipo: TipoPieza; forma: 'cilindro'; posicion: Vec3; radio: number; largo: number; rotacion: Vec3 }

/**
 * Convierte las medidas del JSON en piezas 3D (metros, Y hacia arriba).
 * El centro del tanque está en x=0, z=0; el piso asienta en y=0.
 * El ingreso va en el muro oeste (-x) y la salida en el este (+x).
 */
export function construirPiezas(d: DatosHomogeneizador): Pieza[] {
  const largo = d.tanque.largo.valor
  const ancho = d.tanque.ancho.valor
  const alto = d.tanque.profundidad.valor
  const e = d.tanque.espesorMuro.valor

  const piezas: Pieza[] = [
    { id: 'piso', tipo: 'piso', forma: 'caja', posicion: [0, -e / 2, 0], tamano: [largo + 2 * e, e, ancho + 2 * e] },
    { id: 'muro-oeste', tipo: 'muro', forma: 'caja', posicion: [-(largo + e) / 2, alto / 2, 0], tamano: [e, alto, ancho + 2 * e] },
    { id: 'muro-este', tipo: 'muro', forma: 'caja', posicion: [(largo + e) / 2, alto / 2, 0], tamano: [e, alto, ancho + 2 * e] },
    { id: 'muro-norte', tipo: 'muro', forma: 'caja', posicion: [0, alto / 2, -(ancho + e) / 2], tamano: [largo, alto, e] },
    { id: 'muro-sur', tipo: 'muro', forma: 'caja', posicion: [0, alto / 2, (ancho + e) / 2], tamano: [largo, alto, e] },
  ]

  // Tubo horizontal que atraviesa el muro y sobresale hacia afuera.
  const tubo = (tipo: 'ingreso' | 'salida', lado: -1 | 1, diametro: number, altura: number): Pieza => {
    const largoTubo = e + PROLONGACION_TUBO
    const xCentro = lado * (largo / 2 + e - largoTubo / 2)
    return { id: tipo, tipo, forma: 'cilindro', posicion: [xCentro, altura, 0], radio: diametro / 2, largo: largoTubo, rotacion: [0, 0, Math.PI / 2] }
  }
  piezas.push(tubo('ingreso', -1, d.ingreso.diametro.valor, d.ingreso.altura.valor))
  piezas.push(tubo('salida', 1, d.salida.diametro.valor, d.salida.altura.valor))

  // Difusores repartidos a lo largo del eje del tanque, apoyados en el piso.
  const n = d.difusores.cantidad.valor
  const h = d.difusores.altura.valor
  const radio = d.difusores.diametro.valor / 2
  for (let i = 0; i < n; i++) {
    const x = -largo / 2 + (largo * (i + 0.5)) / n
    piezas.push({ id: `difusor-${i + 1}`, tipo: 'difusor', forma: 'cilindro', posicion: [x, h / 2, 0], radio, largo: h, rotacion: [0, 0, 0] })
  }
  return piezas
}
