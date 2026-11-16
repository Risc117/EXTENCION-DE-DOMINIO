import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/percolador.json'
import { construirEtiquetas } from './anotaciones'
import { esquemaPercolador } from './esquema'

const datos = esquemaPercolador.parse(crudo)
const clon = () => structuredClone(crudo)
const texto = (d: typeof datos, id: string) => construirEtiquetas(d, 6.536, 13.072, 30, true).find((e) => e.id === id)!.texto

describe('T12.1 · las etiquetas arman sus medidas con los valores del JSON', () => {
  it('con los datos del plano dicen DN 200, DN 630 HDPE PN10 y 0.60 × 0.60', () => {
    expect(texto(datos, 'et-brazos')).toContain('4 brazos DN 200')
    expect(texto(datos, 'et-entrada')).toContain('DN 630 HDPE PN10')
    expect(texto(datos, 'et-ventanas')).toContain('0.60 × 0.60')
    expect(texto(datos, 'et-compuerta')).toContain('0.60 × 0.60')
  })

  it('cambiar el lado de las ventanas o de la compuerta cambia su etiqueta', () => {
    const otro = clon()
    otro.camaraInferior.ladoVentana.valor = 0.5
    otro.salida.ladoCompuerta.valor = 0.8
    const d = esquemaPercolador.parse(otro)
    expect(texto(d, 'et-ventanas')).toContain('0.50 × 0.50')
    expect(texto(d, 'et-compuerta')).toContain('0.80 × 0.80')
  })

  it('cambiar el diámetro de los brazos o de la entrada cambia su DN', () => {
    const otro = clon()
    otro.distribuidor.diametroBrazo.valor = 0.25
    otro.entrada.diametro.valor = 0.5
    const d = esquemaPercolador.parse(otro)
    expect(texto(d, 'et-brazos')).toContain('DN 250')
    expect(texto(d, 'et-entrada')).toContain('DN 500')
  })

  it('el material de la entrada sale del JSON, con su fuente del plano, y el esquema lo exige', () => {
    expect(datos.entrada.material.valor).toBe('HDPE PN10')
    expect(datos.entrada.material.fuente).toContain('PERCOLADOR_PLOT.pdf')
    const otro = clon()
    otro.entrada.material.valor = 'PVC'
    expect(texto(esquemaPercolador.parse(otro), 'et-entrada')).toContain('PVC')
    const sin = clon() as unknown as { entrada: Record<string, unknown> }
    delete sin.entrada.material
    expect(esquemaPercolador.safeParse(sin).success).toBe(false)
    const vacio = clon()
    vacio.entrada.material.valor = ''
    expect(esquemaPercolador.safeParse(vacio).success).toBe(false)
  })

  it('el archivo de anotaciones no escribe medidas a mano en los textos', () => {
    const fuente = readFileSync('src/unidades/percolador/anotaciones.ts', 'utf8')
    expect(fuente).not.toMatch(/DN \d/)
    expect(fuente).not.toMatch(/0\.60/)
  })
})

describe('T12.2 · los desfases de las puntas están en constantes', () => {
  it('anotaciones.ts no suma ni resta metros sueltos a las posiciones de las etiquetas', () => {
    const fuente = readFileSync('src/unidades/percolador/anotaciones.ts', 'utf8')
    expect(fuente).not.toMatch(/radioColumna \+ \d/)
    expect(fuente).not.toMatch(/radioExterior - \d/)
    expect(fuente).not.toMatch(/s\.radio - \d/)
  })
})
