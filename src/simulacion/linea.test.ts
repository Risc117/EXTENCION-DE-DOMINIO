import { describe, expect, it } from 'vitest'
import crudo from '../../datos/linea.json'
import planta from '../../datos/planta.json'
import hidro from '../../datos/hidrograma.json'
import type { ParametrosTanque } from '../estado/simulacion'
import escala from '../../datos/escalaCaudal.json'
import { crearHidrograma } from './hidrograma'
import { crearLinea } from './linea'
import { esquemaLinea } from './lineaEsquema'

// Mismas medidas de tanque que usan las pruebas de salida.test.ts (la capa simulacion no importa de unidades).
const tanque: ParametrosTanque = { area: 45.13, alturaUtil: 4.9, alturaTotal: 5.4, alturaEjeSalida: 0.3, diametroSalida: 0.16 }
const DT = 60

describe('datos/linea.json', () => {
  it('es válido y cada unidad real existe en planta.json', () => {
    const l = esquemaLinea.parse(crudo)
    const ids = new Set((planta as { unidades: { id: string }[] }).unidades.map((u) => u.id))
    for (const n of l.nodos.filter((x) => !['bombeo', 'camara-reparto', 'salida'].includes(x.id))) expect(ids.has(n.id)).toBe(true)
  })

  it('lleva los tiempos de la hoja: RAFA 11 h y desinfección 30 min, sin demo', () => {
    const l = esquemaLinea.parse(crudo)
    const rafa = l.nodos.find((n) => n.id === 'rafa')?.retencion
    const cont = l.nodos.find((n) => n.id === 'camara-contacto')?.retencion
    expect(rafa).toMatchObject({ unidad: 'h', demo: false })
    expect(rafa?.valor).toBeCloseTo(11.0159, 3)
    expect(cont).toMatchObject({ valor: 30, unidad: 'min', demo: false })
  })

  it('bombeo, cámara de reparto y sedimentadores quedan como dato de ejemplo', () => {
    const l = esquemaLinea.parse(crudo)
    for (const id of ['bombeo', 'camara-reparto', 'sedimentador-1', 'sedimentador-2'])
      expect(l.nodos.find((n) => n.id === id)?.retencion?.demo).toBe(true)
  })

  it('rechaza fracciones que no suman 1 y agua que va hacia atrás', () => {
    const mala = structuredClone(crudo)
    mala.nodos.find((n) => n.id === 'camara-reparto')!.destinos[0].fraccion = 0.7
    expect(esquemaLinea.safeParse(mala).success).toBe(false)
    const atras = structuredClone(crudo)
    atras.nodos.find((n) => n.id === 'rejas')!.destinos[0].id = 'bombeo'
    expect(esquemaLinea.safeParse(atras).success).toBe(false)
  })

  it('rechaza una unidad de paso sin tiempo de retención', () => {
    const sin = structuredClone(crudo) as { nodos: { id: string; retencion?: unknown }[] }
    delete sin.nodos.find((n) => n.id === 'rafa')!.retencion
    expect(esquemaLinea.safeParse(sin).success).toBe(false)
  })
})

describe('línea encadenada', () => {
  it('con caudal constante, lo que entra sale igual en estado estable', () => {
    const linea = crearLinea(crudo, { tanque, modo: 'constante' })
    let r = linea.paso(10, DT, 10)
    for (let t = 0; t < 30 * 3600; t += DT) r = linea.paso(10, DT, 10)
    expect(r.salida).toBeCloseTo(10, 6)
    expect(r.rebose).toBe(0)
  })

  it('con los sedimentadores 50/50, cada uno recibe la mitad', () => {
    const linea = crearLinea(crudo, { tanque, modo: 'constante' })
    let r = linea.paso(10, DT, 10)
    for (let t = 0; t < 10 * 3600; t += DT) r = linea.paso(10, DT, 10)
    expect(r.nodos['sedimentador-1'].entrada).toBeCloseTo(5, 6)
    expect(r.nodos['sedimentador-2'].entrada).toBeCloseTo(5, 6)
    expect(r.nodos['camara-contacto'].entrada).toBeCloseTo(10, 6)
  })

  it('el pico del hidrograma se aplana después del homogeneizador', () => {
    const hid = crearHidrograma(hidro)
    const linea = crearLinea(crudo, { tanque, modo: 'constante' })
    const promedio = hid.promedio(1)
    let maxEntrada = 0
    let maxHomogeneizador = 0
    for (let t = 0; t < 24 * 3600; t += DT) {
      const r = linea.paso(hid.caudalEntrada(1, t / 3600), DT, promedio)
      maxEntrada = Math.max(maxEntrada, r.entrada)
      maxHomogeneizador = Math.max(maxHomogeneizador, r.nodos.homogeneizador.salida)
    }
    expect(maxHomogeneizador).toBeLessThan(maxEntrada)
    expect(maxHomogeneizador).toBeLessThanOrEqual(promedio + 1e-9)
  })

  it('un cambio de caudal tarda en llegar a la salida (RAFA 11 h + el resto)', () => {
    const linea = crearLinea(crudo, { tanque, modo: 'constante' })
    for (let t = 0; t < 3600; t += DT) linea.paso(5, DT, 5)
    let primero = -1
    for (let t = 0; t < 40 * 3600 && primero < 0; t += DT) {
      const r = linea.paso(20, DT, 20)
      if (r.salida > 5.001) primero = t
    }
    expect(primero).toBeGreaterThan(11 * 3600)
  })

  it('con el hidrograma escalado (≈ 6.5 L/s) el balance sigue cerrando: lo que entra en un día sale', () => {
    const hid = crearHidrograma(hidro, escala)
    const linea = crearLinea(crudo, { tanque, modo: 'constante' })
    const promedio = hid.promedio(1)
    expect(promedio).toBeCloseTo(6.536, 2)
    // Se repite el día 1 varios días hasta llegar a estado estable.
    let entrado = 0
    let salido = 0
    for (let dia = 0; dia < 4; dia++) {
      for (let t = 0; t < 24 * 3600; t += DT) {
        const r = linea.paso(hid.caudalEntrada(1, t / 3600), DT, promedio)
        if (dia === 3) {
          entrado += r.entrada * DT
          salido += r.salida * DT
        }
      }
    }
    expect(Math.abs(entrado - salido) / entrado).toBeLessThan(0.01)
  })
})
