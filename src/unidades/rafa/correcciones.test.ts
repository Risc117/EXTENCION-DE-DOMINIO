import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/rafa.json'
import { construirEtiquetas } from './anotaciones'
import { esquemaRafa } from './esquema'
import { construirPiezas } from './geometria'

const datos = esquemaRafa.parse(crudo)
const clon = () => structuredClone(crudo)

describe('T11.1 · medidas del colector, tubos y caja de muestreo salen del JSON', () => {
  const pieza = (d: ReturnType<typeof esquemaRafa.parse>, id: string) => construirPiezas(d).find((p) => p.id === id)!

  it('la altura del colector sobre el piso y su holgura y espesor vienen de datos/rafa.json, como dato de ejemplo', () => {
    const c = datos.distribucion.colector
    for (const m of [c.alturaSobrePiso, c.holguraPared, c.espesorAnillo, c.altoAnillo, datos.distribucion.tubosFondo.alturaSobrePiso, datos.lodos.margenCajaMuestreo]) expect(m.demo).toBe(true)
    const otro = clon()
    otro.distribucion.colector.alturaSobrePiso.valor = 0.5
    otro.distribucion.colector.holguraPared.valor = 0.3
    otro.distribucion.colector.espesorAnillo.valor = 0.2
    const d = esquemaRafa.parse(otro)
    const antes = pieza(datos, 'colector')
    const despues = pieza(d, 'colector')
    if (antes.forma !== 'anillo' || despues.forma !== 'anillo') throw new Error('El colector es un anillo')
    expect(despues.pos[1] - antes.pos[1]).toBeCloseTo(0.2, 6)
    expect(antes.radioExterior - despues.radioExterior).toBeCloseTo(0.2, 6)
    expect(despues.radioExterior - despues.radioInterior).toBeCloseTo(0.2, 6)
  })

  it('la altura de los tubos de fondo y el margen de la caja de muestreo cambian con el JSON', () => {
    const otro = clon()
    otro.distribucion.tubosFondo.alturaSobrePiso.valor = 0.25
    otro.lodos.margenCajaMuestreo.valor = 0.5
    const d = esquemaRafa.parse(otro)
    expect(pieza(d, 'tubo-fondo-1').pos[1] - pieza(datos, 'tubo-fondo-1').pos[1]).toBeCloseTo(0.15, 6)
    const caja = (x: typeof datos) => {
      const p = pieza(x, 'caja-muestreo')
      if (p.forma !== 'caja') throw new Error('La caja es una caja')
      return p.tam[1]
    }
    expect(caja(d) - caja(datos)).toBeCloseTo(0.3, 6)
  })

  it('la etiqueta del colector dice cuántos ramales hay según el JSON', () => {
    const texto = (x: typeof datos) => construirEtiquetas(x, 6.1, 11, 10.7).find((e) => e.id === 'et-colector')!.texto
    expect(texto(datos)).toContain('22 ramales')
    const otro = clon()
    otro.distribucion.ramalesColector.valor = 12
    expect(texto(esquemaRafa.parse(otro))).toContain('12 ramales')
  })

  it('el esquema exige esas medidas', () => {
    const sin = clon() as unknown as { distribucion: Record<string, unknown> }
    delete sin.distribucion.colector
    expect(esquemaRafa.safeParse(sin).success).toBe(false)
  })
})

describe('T11.2 · "(ej.)" en las etiquetas de piezas con medidas de ejemplo', () => {
  const marcas = (x: typeof datos) => Object.fromEntries(construirEtiquetas(x, 6.1, 11, 10.7).map((e) => [e.id, e.texto.includes('(ej.)')]))

  it('la cámara de efluente, las tomas y las cajas de lodo llevan "(ej.)" porque sus medidas son de ejemplo', () => {
    const m = marcas(datos)
    for (const id of ['et-efluente', 'et-tomas', 'et-muestreo', 'et-descarga', 'et-nivel']) expect(m[id], id).toBe(true)
  })

  it('las piezas con medidas del plano no llevan la marca', () => {
    const m = marcas(datos)
    for (const id of ['et-caja-distribucion', 'et-colector', 'et-sedimentacion', 'et-digestor', 'et-gases']) expect(m[id], id).toBe(false)
  })

  it('la marca desaparece si las medidas dejan de ser de ejemplo (la prueba falla si se quita la lógica)', () => {
    const otro = clon()
    for (const m of [otro.efluente.espesorRejilla, otro.efluente.recoleccionSuperior, otro.efluente.recoleccionInferior, otro.lodos.diametroToma]) m.demo = false
    const m = marcas(esquemaRafa.parse(otro))
    expect(m['et-efluente']).toBe(false)
    expect(m['et-tomas']).toBe(false)
  })
})
