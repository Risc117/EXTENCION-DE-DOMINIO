import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/sedimentador.json'
import escala from '../../../datos/escalaCaudal.json'
import lineaCruda from '../../../datos/linea.json'
import { todasLasMedidas } from '../comun/medidas'
import { planta } from '../planta'
import { esquemaSedimentador } from './esquema'
import { construirAguas, construirPiezas, construirPuente } from './geometria'
import { alturaTotal, areaSuperficial, cargaVertedero, laminaCanal, longitudVertedero, muescas, retencion, velocidadPuente, volumenPlano } from './hidraulica'
import { crearUnidadSedimentador } from './unidad'

const datos = esquemaSedimentador.parse(crudo)
const Qp = escala.caudalPromedio.valor
const Qmh = escala.caudalMaximoHorario.valor
const clon = () => structuredClone(crudo)
const con = (prefijo: string, d = datos) => construirPiezas(d).filter((p) => p.id.startsWith(prefijo))

describe('datos/sedimentador.json', () => {
  it('es válido y cada medida trae su fuente', () => {
    const medidas = todasLasMedidas(datos)
    expect(medidas.length).toBeGreaterThan(30)
    for (const m of medidas) expect(m.fuente.length).toBeGreaterThan(5)
  })

  it('lo que no está en el plano ni en la hoja queda como dato de ejemplo', () => {
    const a = datos.accesorios
    for (const m of [a.anchoPuente, a.altoPuente, a.vueltasPorMinuto, a.anchoPasarela, a.alturaMampara, a.separacionMampara, a.alturaEscalera, a.anchoEscalera, datos.tolva.alturaLodo, datos.canal.profundidad, datos.camaraCentral.diametroDeflector, datos.vertedero.espesorPlaca]) {
      expect(m.demo).toBe(true)
    }
    for (const m of [datos.tanque.diametroInterior, datos.tanque.alturaAgua, datos.tolva.altura, datos.camaraCentral.diametro]) expect(m.demo).not.toBe(true)
  })

  it('anota que el plano da 0.3268 y la hoja 0.0327 en la lámina del canal, sin usar el valor del plano', () => {
    expect(datos.canal.laminaPlano.valor).toBe(0.3268)
    expect(datos.canal.laminaPlano.fuente).toContain('0.0327')
    expect(datos.canal.laminaPlano.demo).toBe(true)
  })

  it('rechaza valor sin fuente, negativo, unidad equivocada y datos que no caben', () => {
    const sinFuente = clon()
    sinFuente.tanque.diametroInterior = { valor: 3.27, unidad: 'm' } as typeof crudo.tanque.diametroInterior
    expect(esquemaSedimentador.safeParse(sinFuente).success).toBe(false)
    const negativo = clon()
    negativo.tanque.alturaAgua.valor = -4.5
    expect(esquemaSedimentador.safeParse(negativo).success).toBe(false)
    const unidad = clon()
    unidad.accesorios.vueltasPorMinuto.unidad = 'hz' as 'rpm'
    expect(esquemaSedimentador.safeParse(unidad).success).toBe(false)
    const camara = clon()
    camara.camaraCentral.diametro.valor = 4
    expect(esquemaSedimentador.safeParse(camara).success).toBe(false)
    const tolva = clon()
    tolva.tolva.diametroMenor.valor = 5
    expect(esquemaSedimentador.safeParse(tolva).success).toBe(false)
    const lodo = clon()
    lodo.tolva.alturaLodo.valor = 3
    expect(esquemaSedimentador.safeParse(lodo).success).toBe(false)
  })
})

describe('medidas y cota', () => {
  it('la altura total es tolva 1.9643 + agua 4.50 + borde libre 0.40 = 6.8643 m', () => {
    expect(alturaTotal(datos)).toBeCloseTo(6.8643, 6)
  })

  it('la coronación de planta.json de las dos unidades es su fondo más la altura total, como dato de ejemplo', () => {
    for (const id of ['sedimentador-1', 'sedimentador-2']) {
      const u = planta.unidades.find((x) => x.id === id)!
      expect(u.cotaCoronacion.valor - u.cotaFondo.valor, id).toBeCloseTo(alturaTotal(datos), 6)
      expect(u.cotaCoronacion.demo, id).toBe(true)
      expect(u.cotaCoronacion.fuente, id).toContain('POR REVISAR CON EL PERFIL')
    }
  })

  it('el vertedero mide π × 3.27 = 10.27 m y tiene una muesca cada 0.20 m', () => {
    expect(longitudVertedero(datos)).toBeCloseTo(Math.PI * 3.27, 6)
    expect(longitudVertedero(datos)).toBeCloseTo(10.27, 1)
    expect(muescas(datos)).toBe(51)
  })

  it('el volumen del plano sale de As × H y se muestra aparte del de la hoja (36.9 m³)', () => {
    expect(areaSuperficial(datos)).toBeCloseTo((Math.PI / 4) * (3.27 ** 2 - 0.49 ** 2), 6)
    expect(volumenPlano(datos)).toBeCloseTo(areaSuperficial(datos) * 4.5, 6)
    expect(volumenPlano(datos)).toBeCloseTo(36.94, 1)
    expect(datos.hidraulica.volumenHoja.valor).toBeCloseTo(36.9, 1)
  })
})

describe('caudal por unidad (Q/2) y tiempos de retención', () => {
  const fraccion = 0.5

  it('cada unidad recibe la mitad del caudal, según datos/linea.json', () => {
    const reparto = lineaCruda.nodos.find((n) => n.id === 'camara-reparto')!.destinos
    for (const id of ['sedimentador-1', 'sedimentador-2']) expect(reparto.find((x) => x.id === id)!.fraccion).toBe(fraccion)
  })

  it('el TR por unidad a Qp/2 es ≈ 3.1 h con la hoja (36.90 m³) y con el plano', () => {
    const q = Qp * fraccion
    expect(retencion(datos.hidraulica.volumenHoja.valor, q)).toBeCloseTo(3.1367, 3)
    expect(retencion(volumenPlano(datos), q)).toBeCloseTo(3.14, 1)
    expect(retencion(36.9, 0)).toBe(Infinity)
  })

  it('linea.json lleva el TR por unidad de 3.137 h (como dato de ejemplo), no el 1.57 h de un solo sedimentador', () => {
    for (const id of ['sedimentador-1', 'sedimentador-2']) {
      const r = (lineaCruda.nodos.find((n) => n.id === id) as { retencion: { valor: number; unidad: string; demo: boolean } }).retencion
      expect(r.unidad).toBe('h')
      expect(r.valor).toBeCloseTo(3.1367, 3)
      expect(r.demo).toBe(true)
    }
  })

  it('la lámina del canal sale de la fórmula de la hoja y vale 0.0327 m con el caudal de la hoja (Qmh/2 por ramal)', () => {
    expect(laminaCanal(datos, Qmh)).toBeCloseTo(0.0327, 4)
    expect(laminaCanal(datos, Qmh * fraccion)).toBeCloseTo(0.0327 / 2, 4)
    expect(laminaCanal(datos, 0)).toBe(0)
  })

  it('el número de ramales del canal viene del JSON (hoja, celda E47): con un solo ramal la lámina se duplica', () => {
    expect(datos.canal.ramales.valor).toBe(2)
    expect(datos.canal.ramales.demo).not.toBe(true)
    const otro = clon()
    otro.canal.ramales.valor = 1
    expect(laminaCanal(esquemaSedimentador.parse(otro), Qmh)).toBeCloseTo(2 * laminaCanal(datos, Qmh), 9)
    const cero = clon()
    cero.canal.ramales.valor = 0
    expect(esquemaSedimentador.safeParse(cero).success).toBe(false)
    const decimales = clon()
    decimales.canal.ramales.valor = 1.5
    expect(esquemaSedimentador.safeParse(decimales).success).toBe(false)
    const sin = clon() as unknown as { canal: Record<string, unknown> }
    delete sin.canal.ramales
    expect(esquemaSedimentador.safeParse(sin).success).toBe(false)
  })

  it('la carga sobre el vertedero sube con el caudal', () => {
    expect(cargaVertedero(datos, 0)).toBe(0)
    expect(cargaVertedero(datos, Qmh * fraccion)).toBeCloseTo((Qmh * fraccion * 86.4) / longitudVertedero(datos), 6)
  })
})

describe('agua y giro', () => {
  it('el agua del tanque llega a la altura de agua y la del canal sube con el caudal de la unidad', () => {
    const tanque = construirAguas(datos, Qp / 2).find((a) => a.id === 'agua-tanque')!
    expect(tanque.nivel).toBeCloseTo(4.5, 6)
    expect(tanque.y0).toBeCloseTo(1.9643, 6)
    const canal = (q: number) => construirAguas(datos, q).find((a) => a.id === 'agua-canal')?.nivel ?? 0
    expect(canal(0)).toBe(0)
    expect(canal(Qp / 2)).toBeGreaterThan(0)
    expect(canal(Qmh / 2)).toBeGreaterThan(canal(Qp / 2))
  })

  it('el puente barrendero cruza el tanque y gira a la velocidad de ejemplo', () => {
    const viga = construirPuente(datos).find((p) => p.id === 'puente-viga')!
    if (viga.forma !== 'caja') throw new Error('La viga es una caja')
    expect(viga.tam[0]).toBeGreaterThan(3.27)
    expect(velocidadPuente(datos)).toBeCloseTo((0.1 * 2 * Math.PI) / 60, 9)
  })
})

describe('geometría armada desde el JSON', () => {
  it('el muro mide 3.27 m por dentro y 3.67 m por fuera, y el canal llega a 4.67 m y 5.07 m', () => {
    const muro = con('muro')[0]
    if (muro.forma !== 'anillo') throw new Error('El muro es un anillo')
    expect(muro.radioInterior).toBeCloseTo(1.635, 6)
    expect(muro.radioExterior).toBeCloseTo(1.835, 6)
    expect(muro.alto).toBeCloseTo(4.9, 6)
    const canal = con('canal-muro')[0]
    if (canal.forma !== 'anillo') throw new Error('El canal es un anillo')
    expect(canal.radioInterior * 2).toBeCloseTo(4.67, 6)
    expect(canal.radioExterior * 2).toBeCloseTo(5.07, 6)
  })

  it('la tolva es un cono de 1.9643 m entre ØT = 1 m y el diámetro interior, abierto (se ve el agua adentro)', () => {
    const tolva = con('tolva')[0]
    if (tolva.forma !== 'cono') throw new Error('La tolva es un cono')
    expect(tolva.alto).toBeCloseTo(1.9643, 6)
    expect(tolva.radioInferior).toBeCloseTo(0.5, 6)
    expect(tolva.radioSuperior).toBeCloseTo(1.635, 6)
    expect(tolva.abierto).toBe(true)
  })

  it('los muros son de concreto opaco salvo con "Ver corte"', () => {
    expect(con('muro')[0].opacidad ?? 1).toBe(1)
    expect(construirPiezas(datos, true).find((p) => p.id === 'muro')!.opacidad).toBeLessThan(1)
  })

  it('cambiar una medida en el JSON cambia la pieza, sin tocar código', () => {
    const otro = clon()
    otro.tanque.diametroInterior.valor = 4
    otro.tolva.altura.valor = 2.598 // (4 − 1) · tan 60° / 2: la tolva debe cuadrar con su ángulo
    const d = esquemaSedimentador.parse(otro)
    const muro = con('muro', d)[0]
    if (muro.forma !== 'anillo') throw new Error('El muro es un anillo')
    expect(muro.radioInterior).toBeCloseTo(2, 6)
    expect(longitudVertedero(d)).toBeGreaterThan(longitudVertedero(datos))
  })

  it('las dos unidades salen de la misma descripción: cambiar el JSON cambia las dos', () => {
    const otro = clon()
    otro.tanque.diametroInterior.valor = 4
    otro.tolva.altura.valor = 2.598 // (4 − 1) · tan 60° / 2: la tolva debe cuadrar con su ángulo
    const d = esquemaSedimentador.parse(otro)
    const u1 = crearUnidadSedimentador(d, 'sedimentador-1', 'Sedimentador 1')
    const u2 = crearUnidadSedimentador(d, 'sedimentador-2', 'Sedimentador 2')
    const base = crearUnidadSedimentador(datos, 'sedimentador-1', 'Sedimentador 1')
    expect(u1.id).toBe('sedimentador-1')
    expect(u2.id).toBe('sedimentador-2')
    expect(u1.tamano).toBe(u2.tamano)
    expect(u1.tamano).toBeGreaterThan(base.tamano)
    expect(u1.demo).toBe(true)
  })
})
