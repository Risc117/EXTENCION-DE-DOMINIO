import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/rejas.json'
import { disponer } from './disposicion'
import { esquemaRejas } from './esquema'
import { construirAguas, construirPiezas, posicionesBarras } from './geometria'
import { laminaBypass, tirante } from './hidraulica'

const datos = esquemaRejas.parse(crudo)
const QMH = 13.072

describe('cámara de rejas', () => {
  it('el tirante a Qmh es el de la hoja (0.0778 m, celda G20)', () => {
    expect(tirante(datos, QMH)).toBeCloseTo(0.0778, 3)
  })

  it('el tirante crece con el caudal y es cero sin caudal', () => {
    expect(tirante(datos, 0)).toBe(0)
    expect(tirante(datos, 6.536)).toBeCloseTo(tirante(datos, QMH) / 2, 6)
  })

  it('con el caudal de diseño no rebasa el vertedero del by-pass', () => {
    expect(laminaBypass(datos, QMH)).toBe(0)
    expect(construirAguas(datos, QMH).map((a) => a.id)).not.toContain('agua-bypass')
  })

  it('con un caudal enorme el agua pasa al by-pass y nunca sube más que el muro', () => {
    const aguas = construirAguas(datos, 400)
    expect(aguas.map((a) => a.id)).toContain('agua-bypass')
    for (const a of aguas) expect(a.nivel).toBeLessThanOrEqual(datos.canal.alturaMuro.valor)
  })

  it('dibuja las barras que caben (8), dentro del canal y sin tocarse', () => {
    const z = posicionesBarras(datos)
    expect(z).toHaveLength(8)
    const e = datos.reja.espesorBarra.valor
    expect(z[0] - e / 2).toBeGreaterThan(-datos.canal.ancho.valor / 2)
    expect(z[7] + e / 2).toBeLessThan(datos.canal.ancho.valor / 2)
    for (let i = 1; i < z.length; i++) expect(z[i] - z[i - 1]).toBeGreaterThan(e)
  })

  it('las barras suben 45° y miden el largo y la altura de la reja de la hoja', () => {
    const barra = construirPiezas(datos).find((p) => p.id === 'barra-0')!
    expect(barra.forma === 'caja' && barra.tam[1]).toBeCloseTo(datos.reja.largo.valor, 6)
    expect(barra.pos[1] * 2).toBeCloseTo(datos.reja.altura.valor, 2)
    expect(barra.giroZ).toBeCloseTo(-Math.PI / 4, 6)
  })

  it('ninguna pieza se hunde bajo la losa', () => {
    for (const p of construirPiezas(datos)) {
      if (p.forma !== 'caja') continue
      expect(p.pos[1] - p.tam[1] / 2, p.id).toBeGreaterThanOrEqual(-datos.canal.espesorLosa.valor - 1e-9)
    }
  })

  it('cambiar una medida en el JSON cambia la pieza, sin tocar código', () => {
    const ancho = structuredClone(crudo)
    ancho.canal.ancho.valor = 0.5
    const otro = esquemaRejas.parse(ancho)
    expect(tirante(otro, QMH)).toBeLessThan(tirante(datos, QMH))
    expect(disponer(otro).zBypass).toBeGreaterThan(disponer(datos).zBypass)
  })

  it('rechaza una reja más alta que el muro o un ángulo imposible', () => {
    const alta = structuredClone(crudo)
    alta.reja.altura.valor = 2
    expect(esquemaRejas.safeParse(alta).success).toBe(false)
    const plana = structuredClone(crudo)
    plana.reja.angulo.valor = 95
    expect(esquemaRejas.safeParse(plana).success).toBe(false)
  })
})

describe('by-pass del lado que dice el plano', () => {
  it('el plano lo pone a la izquierda del flujo, y el espejo lo lleva a -z', async () => {
    const { espejarPiezas } = await import('../comun/espejo')
    expect(datos.bypass.lado.valor).toBe(-1)
    const vertedero = (p: ReturnType<typeof construirPiezas>) => p.find((x) => x.id === 'vertedero-bypass')!.pos[2]
    const normal = construirPiezas(datos)
    expect(vertedero(normal)).toBeGreaterThan(0)
    expect(vertedero(espejarPiezas(normal))).toBeLessThan(0)
  })

  it('la caja de recepción es tan ancha como el canal y no deja cajas de grosor cero', () => {
    expect(datos.recepcion.ancho.valor).toBe(datos.canal.ancho.valor)
    for (const p of construirPiezas(datos)) if (p.forma === 'caja') expect(Math.min(...p.tam), p.id).toBeGreaterThan(0)
  })
})

describe('rejas: medidas del plano', () => {
  it('el canal de rejas (0.30) y el by-pass (0.40) van lado a lado con muros de 0.15: 1.15 m en total', () => {
    const s = disponer(datos)
    expect(datos.canal.ancho.valor).toBe(0.3)
    expect(datos.bypass.anchoCanal.valor).toBe(0.4)
    expect(datos.bypass.anchoCanal.demo).not.toBe(true)
    expect(s.zMuroExterior + datos.canal.espesorMuro.valor / 2 + datos.canal.ancho.valor / 2 + datos.canal.espesorMuro.valor).toBeCloseTo(1.15, 6)
  })
})
