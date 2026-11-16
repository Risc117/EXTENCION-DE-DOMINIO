import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/desarenador.json'
import { disponer } from './disposicion'
import { esquemaDesarenador } from './esquema'
import { construirAguas, construirPiezas } from './geometria'
import { alturaAgua } from './hidraulica'

const datos = esquemaDesarenador.parse(crudo)

describe('desarenador', () => {
  it('la altura a Qmh y a Qmin es la de la hoja (G20 = 0.1378 m y G22 = 0.0445 m)', () => {
    expect(alturaAgua(datos, 13.072)).toBeCloseTo(0.1378, 3)
    expect(alturaAgua(datos, 3.268)).toBeCloseTo(0.0445, 3)
  })

  it('el nivel crece sin saltos con el caudal y es cero sin caudal', () => {
    expect(alturaAgua(datos, 0)).toBe(0)
    let anterior = 0
    for (let q = 0.1; q <= 20; q += 0.1) {
      const h = alturaAgua(datos, q)
      expect(h).toBeGreaterThan(anterior)
      expect(h - anterior).toBeLessThan(0.01)
      anterior = h
    }
  })

  it('el agua no sube más que el muro', () => {
    for (const a of construirAguas(datos, 500)) expect(a.y0 + a.nivel).toBeLessThanOrEqual(datos.canal.alturaMuro.valor + 1e-9)
  })

  it('hay dos canales de 0.32 m con muro central de 0.20 m y muros laterales de 0.15 m (plano, 1.14 m en total)', () => {
    const s = disponer(datos)
    expect(s.zCanales).toHaveLength(2)
    expect(s.zCanales[1] - s.zCanales[0]).toBeCloseTo(0.32 + 0.2, 6)
    expect(s.semiancho * 2).toBeCloseTo(1.14, 6)
    const aguas = construirAguas(datos, 6.536)
    const canales = aguas.filter((a) => a.id.startsWith('agua-canal'))
    expect(canales).toHaveLength(2)
    for (const c of canales) expect(c.forma === 'caja' && c.ancho).toBeCloseTo(0.32, 6)
    const tolva = aguas.find((a) => a.id === 'agua-tolva-1')!
    expect(tolva.forma === 'caja' && tolva.largo).toBeCloseTo(5.17, 6)
    expect(tolva.nivel).toBeCloseTo(0.2, 6)
  })

  it('el 0.30 de la hoja queda solo como dato hidráulico, no como medida del 3D', () => {
    expect(datos.canal.anchoHoja.valor).toBe(0.3)
    expect(datos.canal.ancho.valor).toBe(0.32)
  })

  it('cada canal tiene sus dos placas de tolva, inclinadas en sentidos opuestos', () => {
    const placas = construirPiezas(datos).filter((p) => p.id.startsWith('placa-tolva'))
    expect(placas).toHaveLength(4)
    expect(placas[0].giroX).toBeCloseTo(-(placas[1].giroX ?? 0), 6)
    expect(placas[2].giroX).toBeCloseTo(-(placas[3].giroX ?? 0), 6)
  })

  it('cambiar la longitud en el JSON mueve el muro del vertedero', () => {
    const largo = structuredClone(crudo)
    largo.canal.largo.valor = 8
    const x = (d: typeof datos) => construirPiezas(d).find((p) => p.id === 'cierre-tolva-1')!.pos[0]
    expect(x(esquemaDesarenador.parse(largo))).not.toBeCloseTo(x(datos), 2)
  })

  it('cambiar el número de canales en el JSON cambia las piezas, sin tocar código', () => {
    const uno = structuredClone(crudo)
    uno.canal.numero.valor = 1
    const piezas = construirPiezas(esquemaDesarenador.parse(uno))
    expect(piezas.some((p) => p.id === 'muro-central')).toBe(false)
    expect(piezas.filter((p) => p.id.startsWith('cierre-tolva'))).toHaveLength(1)
  })

  it('rechaza un vertedero más ancho que el canal', () => {
    const ancho = structuredClone(crudo)
    ancho.vertedero.ancho.valor = 0.5
    expect(esquemaDesarenador.safeParse(ancho).success).toBe(false)
  })
})
