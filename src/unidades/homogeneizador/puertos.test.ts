import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/homogeneizador.json'
import conexionesCrudas from '../../../datos/conexiones.json'
import { planta } from '../planta'
import { construirCajasValvula } from './accesorios/cajaValvula'
import { puntoObjetivo } from './anotaciones/puntos'
import { esquemaHomogeneizador } from './esquema'
import { construirPiezas } from './geometria'
import { puertos } from './puertos'

const datos = esquemaHomogeneizador.parse(crudo)
const piezas = construirPiezas(datos)
const pieza = (id: string) => piezas.find((p) => p.id === id)!
const u = planta.unidades.find((x) => x.id === 'homogeneizador')!
const tramo = (id: string) => conexionesCrudas.tramos.find((t) => t.id === id)!
/** Punto del plano (x este, y norte) de un punto local del tanque (x este, z sur). El tanque no está girado. */
const aPlano = ([x, z]: [number, number]) => ({ x: u.x.valor + x, y: u.y.valor - z })
const distancia = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)

describe('T16.3 · puertos del homogeneizador (perfil real)', () => {
  it('las alturas salen del perfil y ya no son de ejemplo: entrada 5.01 m y salida 1.425 m sobre el fondo', () => {
    expect(datos.ingreso.altura.valor).toBeCloseTo(2990.26 - 2985.25, 6)
    expect(datos.salida.altura.valor).toBeCloseTo(2986.675 - 2985.25, 6)
    expect(datos.ingreso.altura.demo).toBe(false)
    expect(datos.salida.altura.demo).toBe(false)
    expect(datos.ingreso.altura.fuente).toContain('HOMOG-TUBERIA')
    expect(datos.salida.altura.fuente).toContain('HOMOG-TUBERIA')
  })

  it('la entrada llega alta, sobre el nivel de agua, y la salida sale baja', () => {
    expect(datos.ingreso.altura.valor).toBeGreaterThan(datos.tanque.alturaUtil.valor)
    expect(datos.salida.altura.valor).toBeLessThan(datos.tanque.alturaUtil.valor / 2)
  })

  it('la salida es casi plana hasta la caja del RAFA (menos de 1 % en 6.6 m) y su ubicación queda por confirmar', () => {
    const subida = datos.salida.alturaEntradaRafa.valor - datos.salida.altura.valor
    expect(Math.abs(subida) / 6.6).toBeLessThan(0.01)
    expect(datos.salida.alturaEntradaRafa.fuente).toContain('POR CONFIRMAR')
  })

  it('la cota de arranque del tubo vertical es derivada y de ejemplo, y queda por confirmar', () => {
    expect(datos.ingreso.alturaPie.demo).toBe(true)
    expect(datos.ingreso.alturaPie.fuente).toContain('derivado')
    expect(datos.ingreso.alturaPie.fuente).toContain('POR CONFIRMAR')
  })

  it('el tubo de entrada cruza el muro y llega al tubo vertical, que sube de su pie hasta el eje del tubo, sin huecos', () => {
    const h = pieza('ingreso')
    const v = pieza('ingreso-subida')
    if (h.forma !== 'cilindro' || v.forma !== 'cilindro') throw new Error('deben ser cilindros')
    const p = puertos(datos)
    // El tubo horizontal termina en el eje del vertical.
    const fi = -(datos.ingreso.angulo.valor * Math.PI) / 180
    const radioExt = datos.tanque.diametroExterior.valor / 2
    const extremo = h.posicion[0] * Math.cos(fi) + h.posicion[2] * Math.sin(fi) + h.largo / 2
    expect(extremo).toBeCloseTo(radioExt + datos.ingreso.distanciaRiser.valor, 6)
    expect(v.posicion[0]).toBeCloseTo(p.ingreso.pie[0], 6)
    expect(v.posicion[2]).toBeCloseTo(p.ingreso.pie[1], 6)
    expect(v.posicion[1] - v.largo / 2).toBeCloseTo(datos.ingreso.alturaPie.valor, 6)
    expect(v.posicion[1] + v.largo / 2).toBeCloseTo(datos.ingreso.altura.valor + datos.ingreso.diametro.valor / 2, 6)
  })

  it('la salida sale por el muro y su tubo termina a 1.5 m de la cara exterior', () => {
    const s = pieza('salida')
    if (s.forma !== 'cilindro') throw new Error('debe ser un cilindro')
    const p = puertos(datos)
    const fi = -(datos.salida.angulo.valor * Math.PI) / 180
    expect(s.posicion[1]).toBeCloseTo(datos.salida.altura.valor, 6)
    expect(s.posicion[0] * Math.cos(fi) + s.posicion[2] * Math.sin(fi) + s.largo / 2).toBeCloseTo(Math.hypot(...p.salida.fin), 6)
  })

  it('el último punto de T06 cae a menos de 10 cm del pie del tubo vertical y el primero de T07, del extremo del tubo de salida', () => {
    const p = puertos(datos)
    const fin = tramo('T06').trazado[tramo('T06').trazado.length - 1]
    expect(distancia(fin, aPlano(p.ingreso.pie))).toBeLessThan(0.1)
    expect(distancia(tramo('T07').trazado[0], aPlano(p.salida.fin))).toBeLessThan(0.1)
  })

  it('las cotas de esos extremos salen del perfil: T06 llega al pie del tubo vertical y T07 sale a la altura del eje de salida', () => {
    const fondo = 2985.25
    expect(tramo('T06').cotaLlegada.valor).toBeCloseTo(fondo + datos.ingreso.alturaPie.valor, 2)
    expect(tramo('T07').cotaSalida.valor).toBeCloseTo(fondo + datos.salida.altura.valor, 2)
  })

  it('las cajas de válvula y las flechas de las etiquetas siguen a los puertos', () => {
    const fiIngreso = -(datos.ingreso.angulo.valor * Math.PI) / 180
    const valvula = construirCajasValvula(datos).find((c) => c.id === 'valvula-ingreso')!
    expect(Math.atan2(valvula.posicion[2], valvula.posicion[0])).toBeCloseTo(Math.atan2(Math.sin(fiIngreso), Math.cos(fiIngreso)), 6)
    const punto = puntoObjetivo(datos, 'salida', 0).punto
    const fiSalida = -(datos.salida.angulo.valor * Math.PI) / 180
    expect(Math.atan2(punto[2], punto[0])).toBeCloseTo(Math.atan2(Math.sin(fiSalida), Math.cos(fiSalida)), 6)
    expect(punto[1]).toBeCloseTo(datos.salida.altura.valor, 6)
  })

  it('la válvula de la entrada cae sobre su tubo horizontal (no más lejos que el tubo vertical), sin caja ni varilla (va por el aire), y la flecha apunta a ella', () => {
    const radioExt = datos.tanque.diametroExterior.valor / 2
    const alcance = radioExt + datos.ingreso.distanciaRiser.valor
    const piezasAcc = construirCajasValvula(datos)
    expect(piezasAcc.some((c) => c.id === 'caja-valvula-ingreso' || c.id === 'varilla-ingreso')).toBe(false)
    for (const id of ['valvula-ingreso']) {
      const a = piezasAcc.find((c) => c.id === id)!
      const r = Math.hypot(a.posicion[0], a.posicion[2])
      expect(r, id).toBeGreaterThan(radioExt)
      expect(r, id).toBeLessThan(alcance)
    }
    const punta = puntoObjetivo(datos, 'ingreso', 0).punto
    expect(Math.hypot(punta[0], punta[2])).toBeGreaterThan(radioExt)
    expect(Math.hypot(punta[0], punta[2])).toBeLessThan(alcance)
    // La salida sigue con su tubo de 1.5 m.
    const salida = piezasAcc.find((c) => c.id === 'valvula-salida')!
    expect(Math.hypot(salida.posicion[0], salida.posicion[2])).toBeLessThanOrEqual(radioExt + 1.5 + 1e-9)
  })

  it('el ángulo de cada puerto es derivado del mapa general y de ejemplo', () => {
    for (const a of [datos.ingreso.angulo, datos.salida.angulo]) {
      expect(a.demo).toBe(true)
      expect(a.fuente).toContain('derivado')
    }
  })
})
