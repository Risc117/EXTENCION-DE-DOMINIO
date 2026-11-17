import { describe, expect, it } from 'vitest'
import conexionesCrudas from '../../../datos/conexiones.json'
import crudo from '../../../datos/rafa.json'
import { planta } from '../planta'
import { construirEtiquetas } from './anotaciones'
import { disponer } from './disposicion'
import { esquemaRafa } from './esquema'
import { construirPiezas } from './geometria'
import { puertoAfluente } from './puertos'

const datos = esquemaRafa.parse(crudo)
const s = disponer(datos)
const piezas = construirPiezas(datos)
const pieza = (id: string) => piezas.find((p) => p.id === id)!
const caja = (id: string) => {
  const p = pieza(id)
  if (p.forma !== 'caja') throw new Error(`${id} debe ser una caja`)
  return p
}
const u = planta.unidades.find((x) => x.id === 'rafa')!
/** Punto del plano de un punto local [x, z] del RAFA (x a lo largo, z a lo ancho, el sur de la escena hacia +z con giro 0). */
function aPlano([x, z]: [number, number]) {
  const g = (u.giro.valor * Math.PI) / 180
  return { x: u.x.valor + x * Math.cos(g) + z * Math.sin(g), y: u.y.valor + x * Math.sin(g) - z * Math.cos(g) }
}
const tramo = (id: string) => conexionesCrudas.tramos.find((t) => t.id === id)!

describe('T16.4 · RAFA: caja de distribución al oeste y lodos al este', () => {
  it('la caja de distribución va a la mitad del lado oeste (−z), sobre la losa, y no en un extremo', () => {
    const c = caja('caja-distribucion')
    expect(c.pos[2]).toBeLessThan(0)
    expect(c.pos[2] - c.tam[2] / 2).toBeCloseTo(-s.semiAncho, 6)
    expect(Math.abs(c.pos[0])).toBeLessThan(s.semiLargo / 3)
    expect(c.pos[0]).toBeCloseTo(-datos.distribucion.caja.desplazamientoSur.valor, 6)
    expect(c.pos[1] - c.tam[1] / 2).toBeCloseTo(s.yLosa, 6)
  })

  it('el desplazamiento de la caja sale del DXF (válvula y rama a x ≈ −1.3 m) y es derivado y de ejemplo', () => {
    const m = datos.distribucion.caja.desplazamientoSur
    expect(m.valor).toBeCloseTo(1.3, 6)
    expect(m.demo).toBe(true)
    expect(m.fuente).toContain('.dxf')
  })

  it('el tubo afluente entra a la caja desde el oeste (a lo largo de z) y termina a 1.5 m de la pared', () => {
    const t = pieza('tubo-afluente')
    if (t.forma !== 'cilindro') throw new Error('debe ser un cilindro')
    expect(t.eje).toBe('z')
    const p = puertoAfluente(datos)
    expect(p[1]).toBeCloseTo(-(s.semiAncho + 1.5), 6)
    expect(t.pos[2] - t.alto / 2).toBeCloseTo(p[1], 6)
    expect(t.pos[1]).toBeCloseTo(s.yLosa + datos.distribucion.caja.alto.valor / 2, 6)
  })

  it('T08 termina en el extremo del tubo afluente (menos de 10 cm) a la cota de su eje', () => {
    const t = tramo('T08')
    const fin = t.trazado[t.trazado.length - 1]
    const p = aPlano(puertoAfluente(datos))
    expect(Math.hypot(fin.x - p.x, fin.y - p.y)).toBeLessThan(0.1)
    expect(t.cotaLlegada.valor).toBeCloseTo(u.cotaFondo.valor + s.yLosa + datos.distribucion.caja.alto.valor / 2, 2)
  })

  it('los lodos salen por el este (+z): las tomas y las dos cajas', () => {
    for (const p of piezas.filter((x) => x.id.startsWith('toma-lodo-'))) expect(p.pos[2]).toBeGreaterThan(s.semiAnchoInterior)
    expect(caja('caja-muestreo').pos[2]).toBeGreaterThan(s.semiAncho)
    expect(caja('caja-descarga').pos[2]).toBeGreaterThan(s.semiAncho)
  })

  it('las etiquetas de los lodos y de la caja de distribución apuntan a su nuevo lado', () => {
    const e = (id: string) => construirEtiquetas(datos, 3, 11, 11).find((x) => x.id === id)!
    for (const id of ['et-tomas', 'et-muestreo', 'et-descarga']) expect(e(id).punta[2], id).toBeGreaterThan(0)
    expect(e('et-caja-distribucion').punta[2]).toBeLessThan(0)
    expect(Math.abs(e('et-caja-distribucion').punta[0])).toBeLessThan(s.semiLargo / 3)
  })
})
