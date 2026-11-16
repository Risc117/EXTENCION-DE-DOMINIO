import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/sedimentador.json'
import escala from '../../../datos/escalaCaudal.json'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { esquemaSedimentador } from './esquema'

const datos = esquemaSedimentador.parse(crudo)
const Qp = escala.caudalPromedio.valor

describe('cotas y etiquetas', () => {
  const etiquetas = (q = Qp / 2) => construirEtiquetas(datos, q)

  it('las cotas dicen 3.27, 0.20, 4.67, 4.50, 0.40 y la tolva', () => {
    const t = construirCotas(datos).map((c) => c.texto)
    for (const x of ['Diámetro interior = 3.27 m', 'Muro e = 0.20 m', 'Canal Ø = 4.67 m', 'Altura de agua = 4.50 m', 'Borde libre = 0.40 m', 'Tolva = 1.96 m']) expect(t).toContain(x)
  })

  it('las etiquetas de piezas con medidas de ejemplo llevan "(ej.)" y las del plano no', () => {
    const m = Object.fromEntries(etiquetas().map((e) => [e.id, e.texto.includes('(ej.)')]))
    for (const id of ['et-deflector', 'et-puente', 'et-pasarela', 'et-mampara', 'et-escalera', 'et-lodo', 'et-canal', 'et-vertedero']) expect(m[id], id).toBe(true)
    for (const id of ['et-muro', 'et-tolva', 'et-camara-central', 'et-caudal', 'et-tr-hoja', 'et-tr-plano']) expect(m[id], id).toBe(false)
  })

  it('muestra el caudal por unidad, los dos TR y la carga sobre el vertedero', () => {
    const t = Object.fromEntries(etiquetas().map((e) => [e.id, e.texto]))
    expect(t['et-caudal']).toContain('3.27')
    expect(t['et-tr-hoja']).toContain('3.14')
    expect(t['et-tr-plano']).toContain('3.14')
    expect(t['et-vertedero']).toContain('51 muescas')
    expect(t['et-alimentacion']).toContain('DN 160')
  })

  it('sin caudal el TR dice "sin caudal"', () => {
    expect(etiquetas(0).find((e) => e.id === 'et-tr-hoja')!.texto).toContain('sin caudal')
  })
})

describe('T13.1 · "(ej.)" sigue a las medidas de ejemplo', () => {
  it('el canal y el vertedero pierden la marca si su profundidad y el espesor de la placa dejan de ser de ejemplo', () => {
    const otro = structuredClone(crudo)
    otro.canal.profundidad.demo = false
    otro.vertedero.espesorPlaca.demo = false
    const m = Object.fromEntries(construirEtiquetas(esquemaSedimentador.parse(otro), Qp / 2).map((e) => [e.id, e.texto.includes('(ej.)')]))
    expect(m['et-canal']).toBe(false)
    expect(m['et-vertedero']).toBe(false)
  })
})
