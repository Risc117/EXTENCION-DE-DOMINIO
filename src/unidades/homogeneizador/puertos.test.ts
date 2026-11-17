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

  it('T16.4.6 · no hay tubo vertical por fuera del muro: la entrada cruza el muro hasta 1.5 m y el único tramo vertical es el codo que baja hacia adentro', () => {
    expect(piezas.some((q) => q.id === 'ingreso-subida')).toBe(false)
    const h = pieza('ingreso')
    const codo = pieza('ingreso-codo')
    if (h.forma !== 'cilindro' || codo.forma !== 'cilindro') throw new Error('deben ser cilindros')
    const p = puertos(datos)
    const fi = -(datos.ingreso.angulo.valor * Math.PI) / 180
    const radioInt = datos.tanque.diametroInterior.valor / 2
    const radioExt = datos.tanque.diametroExterior.valor / 2
    // El tubo horizontal termina a 1.5 m de la cara exterior, en el puerto.
    expect(h.posicion[0] * Math.cos(fi) + h.posicion[2] * Math.sin(fi) + h.largo / 2).toBeCloseTo(radioExt + 1.5, 6)
    expect(Math.hypot(...p.ingreso.fin)).toBeCloseTo(radioExt + 1.5, 6)
    // El codo está dentro del tanque, arranca en el eje del tubo y baja `caidaInterior`.
    expect(Math.hypot(codo.posicion[0], codo.posicion[2])).toBeLessThan(radioInt)
    expect(codo.posicion[1] + codo.largo / 2).toBeCloseTo(datos.ingreso.altura.valor + datos.ingreso.diametro.valor / 2, 6)
    expect(codo.largo).toBeCloseTo(datos.ingreso.caidaInterior.valor + datos.ingreso.diametro.valor / 2, 6)
    // Ninguna otra pieza vertical de la entrada queda fuera del muro.
    for (const q of piezas.filter((x) => x.tipo === 'ingreso' && x.forma === 'cilindro' && x.rotacion[2] === 0)) {
      expect(Math.hypot(q.posicion[0], q.posicion[2]), q.id).toBeLessThan(radioInt)
    }
  })

  it('el codo baja desde el eje (2990.26) hasta 2989.40, la cota del perfil donde el dibujo lo interrumpe (0.86 m); su lugar (adentro) es indicación del usuario y el DXF lo dibuja afuera: queda por confirmar', () => {
    expect(datos.ingreso.caidaInterior.valor).toBeCloseTo(2990.26 - 2989.4, 6)
    const codo = pieza('ingreso-codo')
    if (codo.forma !== 'cilindro') throw new Error('debe ser un cilindro')
    expect(2985.25 + codo.posicion[1] - codo.largo / 2).toBeCloseTo(2989.4, 6)
    expect(datos.ingreso.caidaInterior.fuente).toContain('POR CONFIRMAR')
    expect(datos.ingreso.caidaInterior.fuente).toContain('HOMOG-TUBERIA')
  })

  it('la salida sale por el muro y su tubo termina a 1.5 m de la cara exterior', () => {
    const s = pieza('salida')
    if (s.forma !== 'cilindro') throw new Error('debe ser un cilindro')
    const p = puertos(datos)
    const fi = -(datos.salida.angulo.valor * Math.PI) / 180
    expect(s.posicion[1]).toBeCloseTo(datos.salida.altura.valor, 6)
    expect(s.posicion[0] * Math.cos(fi) + s.posicion[2] * Math.sin(fi) + s.largo / 2).toBeCloseTo(Math.hypot(...p.salida.fin), 6)
  })

  it('el último punto de T06 cae a menos de 10 cm del extremo del tubo de entrada y el primero de T07, del extremo del tubo de salida', () => {
    const p = puertos(datos)
    const fin = tramo('T06').trazado[tramo('T06').trazado.length - 1]
    expect(distancia(fin, aPlano(p.ingreso.fin))).toBeLessThan(0.1)
    expect(distancia(tramo('T07').trazado[0], aPlano(p.salida.fin))).toBeLessThan(0.1)
  })

  it('las cotas salen del perfil: T06 llega a la altura del eje de entrada (2990.26) y T07 sale a la del eje de salida (2986.675)', () => {
    const fondo = 2985.25
    expect(tramo('T06').cotaLlegada.valor).toBeCloseTo(fondo + datos.ingreso.altura.valor, 2)
    expect(tramo('T07').cotaSalida.valor).toBeCloseTo(fondo + datos.salida.altura.valor, 2)
  })

  it('T06 no tiene ningún tramo vertical: llega con pendiente continua desde el buzón anterior (BZ-3), sin vértices intermedios, y está marcado sobre relleno por confirmar', () => {
    const t = tramo('T06')
    expect(t.trazado).toHaveLength(2)
    expect(t.desde).toBe('BZ-3')
    const largo = distancia(t.trazado[0], t.trazado[1])
    expect(largo).toBeGreaterThan(3)
    const pendiente = Math.abs(t.cotaLlegada.valor - t.cotaSalida.valor) / largo
    expect(pendiente).toBeLessThan(0.15)
    // Baja hacia el tanque: la pendiente va del buzón (más alto) al muro.
    expect(t.cotaSalida.valor).toBeGreaterThan(t.cotaLlegada.valor)
    expect(t.cotaSalida.valor).toBeCloseTo(tramo('T05').cotaLlegada.valor, 6)
    expect(t.sobreRelleno).toBe(true)
    expect(t.fuenteTrazado).toContain('relleno')
    expect(t.fuenteTrazado).toContain('POR CONFIRMAR')
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

  it('la válvula de la entrada cae sobre su tubo horizontal (dentro de los 1.5 m que salen del muro), sin caja ni varilla (va por el aire), y la flecha apunta a ella', () => {
    const radioExt = datos.tanque.diametroExterior.valor / 2
    const alcance = radioExt + 1.5
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
