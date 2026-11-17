import { describe, expect, it } from 'vitest'
import conexionesCrudas from '../../../datos/conexiones.json'
import crudo from '../../../datos/sedimentador.json'
import { planta } from '../planta'
import { construirEtiquetas } from './anotaciones'
import { disponer } from './disposicion'
import { esquemaSedimentador } from './esquema'
import { construirPiezas } from './geometria'
import { alturaTotal } from './hidraulica'
import { extremos } from './puertos'

const datos = esquemaSedimentador.parse(crudo)
const s = disponer(datos)
const IDS = ['sedimentador-1', 'sedimentador-2'] as const
const unidad = (id: string) => planta.unidades.find((u) => u.id === id)!
const pieza = (id: string, instancia: string) => {
  const p = construirPiezas(datos, false, instancia).find((x) => x.id === id)!
  if (p.forma !== 'cilindro') throw new Error(`${id} debe ser un cilindro`)
  return p
}
const tramo = (id: string) => conexionesCrudas.tramos.find((t) => t.id === id)!
/** Punto del plano de un punto local [x, z] del sedimentador (no está girado). */
const aPlano = (id: string, [x, z]: [number, number]) => ({ x: unidad(id).x.valor + x, y: unidad(id).y.valor - z })
const distancia = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)
const TRAMOS = { 'sedimentador-1': { entrada: 'T14', salida: 'T16', purga: 'T24' }, 'sedimentador-2': { entrada: 'T15', salida: 'T17', purga: 'T25' } } as const

describe('T16.4 · sedimentadores: perfil, fondo y puertos', () => {
  it('el fondo sale de alinear la salida del perfil (2978.686) con la del tanque, para los dos, derivado y de ejemplo', () => {
    for (const id of IDS) {
      const u = unidad(id)
      const salida = pieza('tubo-salida', id)
      expect(u.cotaFondo.valor + salida.pos[1], id).toBeCloseTo(2978.686, 2)
      expect(u.cotaFondo.valor).toBeCloseTo(2972.34, 2)
      expect(u.cotaFondo.demo).toBe(true)
      expect(u.cotaFondo.fuente).toContain('derivado')
      expect(u.cotaCoronacion.valor - u.cotaFondo.valor).toBeCloseTo(alturaTotal(datos), 4)
    }
  })

  it('la entrada queda en la cota 2975.188 del perfil: 2.848 m sobre el fondo, de ejemplo porque el fondo lo es', () => {
    expect(datos.tuberias.alturaEntrada.demo).toBe(true)
    expect(datos.tuberias.alturaEntrada.fuente).toContain('FLUJO-ENTRADA')
    for (const id of IDS) {
      expect(unidad(id).cotaFondo.valor + pieza('tubo-entrada', id).pos[1], id).toBeCloseTo(2975.188, 2)
    }
  })

  it('el tubo vertical de alimentación sube desde el eje de la entrada hasta la cámara central', () => {
    const v = pieza('tubo-alimentacion', 'sedimentador-1')
    expect(v.pos[1] - v.alto / 2).toBeCloseTo(datos.tuberias.alturaEntrada.valor, 6)
    expect(v.pos[1] + v.alto / 2).toBeCloseTo(s.yAgua - datos.camaraCentral.altura.valor, 6)
  })

  it('cada instancia tiene sus propios ángulos: la salida va al suroeste en el 1 y al noreste en el 2; la entrada al noroeste en los dos', () => {
    const a = (id: keyof typeof datos.puertos) => datos.puertos[id]
    expect(a('sedimentador-1').salida.valor).toBeCloseTo(224.1, 1)
    expect(a('sedimentador-2').salida.valor).toBeCloseTo(44.1, 1)
    for (const id of IDS) {
      expect(a(id).entrada.valor).toBeGreaterThan(90)
      expect(a(id).entrada.valor).toBeLessThan(180)
      for (const p of [a(id).entrada, a(id).salida, a(id).purga]) {
        expect(p.demo).toBe(true)
        expect(p.fuente).toContain('derivado')
      }
    }
  })

  it('los tubos salen radialmente en su ángulo y terminan a 1.5 m del canal', () => {
    for (const id of IDS) {
      for (const [nombre, tubo] of [['entrada', 'tubo-entrada'], ['salida', 'tubo-salida'], ['purga', 'tubo-purga']] as const) {
        const t = pieza(tubo, id)
        const angulo = Math.atan2(-t.pos[2], t.pos[0])
        const esperado = (datos.puertos[id][nombre].valor * Math.PI) / 180
        expect(Math.cos(angulo - esperado), `${id} ${nombre}`).toBeCloseTo(1, 6)
        const fin = extremos(datos, id)[nombre]
        expect(Math.hypot(...fin)).toBeCloseTo(s.radioCanalExterior + 1.5, 6)
      }
    }
  })

  it('los tramos de conexiones.json arrancan o terminan en el extremo del tubo (menos de 10 cm) y a la cota del puerto', () => {
    for (const id of IDS) {
      const e = extremos(datos, id)
      const fondo = unidad(id).cotaFondo.valor
      const entrada = tramo(TRAMOS[id].entrada)
      const salida = tramo(TRAMOS[id].salida)
      const purga = tramo(TRAMOS[id].purga)
      expect(distancia(entrada.trazado[entrada.trazado.length - 1], aPlano(id, e.entrada)), `${id} entrada`).toBeLessThan(0.1)
      expect(distancia(salida.trazado[0], aPlano(id, e.salida)), `${id} salida`).toBeLessThan(0.1)
      expect(distancia(purga.trazado[0], aPlano(id, e.purga)), `${id} purga`).toBeLessThan(0.1)
      expect(entrada.cotaLlegada.valor).toBeCloseTo(fondo + datos.tuberias.alturaEntrada.valor, 2)
      expect(salida.cotaSalida.valor).toBeCloseTo(2978.686, 2)
      expect(purga.cotaSalida.valor).toBeCloseTo(fondo - datos.tuberias.diametroPurga.valor / 2, 2)
    }
  })

  it('las flechas de las etiquetas siguen a los tubos', () => {
    for (const id of IDS) {
      const e = construirEtiquetas(datos, 3, id)
      for (const [et, nombre] of [['et-salida', 'salida'], ['et-purga', 'purga']] as const) {
        const punta = e.find((x) => x.id === et)!.punta
        const angulo = Math.atan2(-punta[2], punta[0])
        expect(Math.cos(angulo - (datos.puertos[id][nombre].valor * Math.PI) / 180), `${id} ${et}`).toBeCloseTo(1, 6)
      }
    }
  })
})
