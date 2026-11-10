import { describe, expect, it } from 'vitest'
import crudo from '../../../../datos/homogeneizador.json'
import { esquemaHomogeneizador } from '../esquema'
import { calcularEtiqueta } from './construirEtiquetas'
import { construirCotas } from './construirCotas'
import { medidaPorRuta } from './medidaPorRuta'

const datos = () => esquemaHomogeneizador.parse(structuredClone(crudo))
const distancia = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

describe('esquema de las anotaciones (JSON)', () => {
  it('los datos del proyecto lo cumplen', () => {
    expect(esquemaHomogeneizador.safeParse(crudo).success).toBe(true)
  })

  it('rechaza una cota que apunta a una medida que no existe', () => {
    const malo = structuredClone(crudo) as unknown as { anotaciones: { cotas: { medida: string }[] } }
    malo.anotaciones.cotas[0].medida = 'tanque.noExiste'
    expect(esquemaHomogeneizador.safeParse(malo).success).toBe(false)
  })

  it('rechaza ids repetidos', () => {
    const malo = structuredClone(crudo) as unknown as { anotaciones: { cotas: { id: string }[] } }
    malo.anotaciones.cotas[1].id = malo.anotaciones.cotas[0].id
    expect(esquemaHomogeneizador.safeParse(malo).success).toBe(false)
  })

  it('rechaza un texto con {valor} si no hay medida de donde sacarlo', () => {
    const malo = structuredClone(crudo) as unknown as { anotaciones: { etiquetas: { medida?: string; texto: string }[] } }
    const e = malo.anotaciones.etiquetas.find((x) => x.medida)
    if (!e) throw new Error('El JSON debe traer una etiqueta con medida')
    delete e.medida
    e.texto = 'Algo {valor}'
    expect(esquemaHomogeneizador.safeParse(malo).success).toBe(false)
  })

  it('rechaza un objetivo desconocido', () => {
    const malo = structuredClone(crudo) as unknown as { anotaciones: { etiquetas: { objetivo: string }[] } }
    malo.anotaciones.etiquetas[0].objetivo = 'cohete'
    expect(esquemaHomogeneizador.safeParse(malo).success).toBe(false)
  })
})

describe('medidaPorRuta', () => {
  it('lee una medida por su ruta y rechaza lo que no es medida', () => {
    expect(medidaPorRuta(datos(), 'tanque.diametroInterior')?.valor).toBe(7.58)
    expect(medidaPorRuta(datos(), 'tanque')).toBeNull()
    expect(medidaPorRuta(datos(), 'tanque.constructor')).toBeNull()
  })
})

describe('cotas', () => {
  const porId = (d = datos()) => Object.fromEntries(construirCotas(d).map((c) => [c.id, c]))

  it('muestran Di, H, BL, Ht y e con los valores del JSON', () => {
    const c = porId()
    expect(c.di.texto).toBe('Di = 7.58 m')
    expect(c.h.texto).toBe('H = 4.90 m (N.A.)')
    expect(c.bl.texto).toBe('BL = 0.50 m')
    expect(c.ht.texto).toBe('Ht = 5.40 m')
    expect(c.e.texto).toBe('e = 0.20 m')
  })

  it('la línea mide lo que dice la medida', () => {
    const c = porId()
    expect(distancia(c.di.a, c.di.b)).toBeCloseTo(7.58)
    expect(distancia(c.h.a, c.h.b)).toBeCloseTo(4.9)
    expect(distancia(c.ht.a, c.ht.b)).toBeCloseTo(5.4)
    expect(c.bl.a[1]).toBeCloseTo(4.9)
    expect(c.bl.b[1]).toBeCloseTo(5.4)
  })

  it('cambiar una medida en el JSON cambia el texto y la línea, sin tocar código', () => {
    const d = datos()
    d.tanque.diametroInterior.valor = 8
    const di = porId(d).di
    expect(di.texto).toBe('Di = 8.00 m')
    expect(distancia(di.a, di.b)).toBeCloseTo(8)
  })

  it('quitar una cota del JSON la quita de la lista', () => {
    const d = datos()
    d.anotaciones.cotas = d.anotaciones.cotas.filter((c) => c.id !== 'e')
    expect(porId(d).e).toBeUndefined()
  })

  it('Ht va en otra columna, más lejos del muro que H', () => {
    const c = porId()
    expect(Math.hypot(c.ht.a[0], c.ht.a[2])).toBeGreaterThan(Math.hypot(c.h.a[0], c.h.a[2]))
  })

  it('marca como ejemplo la cota cuya medida es de ejemplo', () => {
    const d = datos()
    d.tanque.espesorMuro.demo = true
    expect(porId(d).e.texto).toMatch(/\(ej\.\)$/)
  })
})

describe('etiquetas', () => {
  const calc = (id: string, nivel = 0, d = datos()) => {
    const def = d.anotaciones.etiquetas.find((e) => e.id === id)
    if (!def) throw new Error(`Falta la etiqueta ${id}`)
    return calcularEtiqueta(d, def, nivel)
  }

  it('traen los textos del JSON con sus medidas', () => {
    expect(calc('entrada').texto).toBe('ENTRADA, tubería Ø 6" PVC (agua residual)')
    expect(calc('salida').texto).toBe('SALIDA, tubería Ø 6" PVC (a RAFA)')
    expect(calc('boca').texto).toBe('Boca de acceso 1.00 x 1.00')
    expect(calc('baranda').texto).toBe('Baranda h = 1.05')
    expect(calc('agitador').texto).toBe('Agitador sumergible')
    expect(calc('zona').texto).toBe('Zona de mezcla')
  })

  it('el rebose es dato de ejemplo y se marca', () => {
    expect(calc('rebose').texto).toBe('Rebose Ø 0.20 (ej.)')
  })

  it('el nivel de agua muestra el nivel actual de la simulación', () => {
    expect(calc('nivel', 3.2).texto).toBe('Nivel de agua (N.A.) = 3.20 m')
    expect(calc('nivel', 3.2).punta[1]).toBeCloseTo(3.2)
    expect(calc('nivel', 1).punta[1]).toBeCloseTo(1)
  })

  it('la flecha apunta a la pieza: la entrada al oeste y la salida al este, a la altura de su tubo', () => {
    expect(calc('entrada').punta[0]).toBeLessThan(-3.99)
    expect(calc('entrada').punta[1]).toBeCloseTo(5.1)
    expect(calc('salida').punta[0]).toBeGreaterThan(3.99)
    expect(calc('salida').punta[1]).toBeCloseTo(0.3)
  })

  it('el texto queda separado de la pieza por el desfase del JSON', () => {
    const e = calc('agitador')
    expect(distancia(e.origen, e.punta)).toBeGreaterThan(0.5)
  })

  it('las piezas de adentro se marcan como interiores', () => {
    expect(calc('agitador').interior).toBe(true)
    expect(calc('nivel').interior).toBe(true)
    expect(calc('entrada').interior).toBe(false)
  })
})
