import { describe, expect, it } from 'vitest'
import conexionesCrudas from '../../../datos/conexiones.json'
import crudo from '../../../datos/rafa.json'
import { planta } from '../planta'
import { construirEtiquetas } from './anotaciones'
import { disponer } from './disposicion'
import { esquemaRafa } from './esquema'
import { construirPiezas } from './geometria'
import { puertoAfluente, puertoEfluenteExtremo } from './puertos'

const datos = esquemaRafa.parse(crudo)
const s = disponer(datos)
const c = datos.distribucion.caja
const piezas = construirPiezas(datos)
const pieza = (id: string) => piezas.find((p) => p.id === id)!
const caja = (id: string) => {
  const p = pieza(id)
  if (p.forma !== 'caja') throw new Error(`${id} debe ser una caja`)
  return p
}
const cilindro = (id: string) => {
  const p = pieza(id)
  if (p.forma !== 'cilindro') throw new Error(`${id} debe ser un cilindro`)
  return p
}
const u = planta.unidades.find((x) => x.id === 'rafa')!
/** Punto del plano de un punto local [x, z] del RAFA (x a lo largo, z a lo ancho). */
function aPlano([x, z]: [number, number]) {
  const g = (u.giro.valor * Math.PI) / 180
  return { x: u.x.valor + x * Math.cos(g) + z * Math.sin(g), y: u.y.valor + x * Math.sin(g) - z * Math.cos(g) }
}
const tramo = (id: string) => conexionesCrudas.tramos.find((t) => t.id === id)!

describe('T16.4.4 · RAFA según el plano de detalle: el eje A-A cruza por la mitad del largo', () => {
  it('la caja de distribución va centrada sobre A-A (x = 0), pegada por fuera al lado oeste, de 1.90 × 1.11 m, sin el desplazamiento de 1.3 m', () => {
    const b = caja('caja-distribucion')
    expect(b.pos[0]).toBeCloseTo(0, 9)
    expect(b.tam[0]).toBeCloseTo(1.9, 9)
    expect(b.tam[1]).toBeCloseTo(1.11, 9)
    expect(b.pos[2] + b.tam[2] / 2).toBeCloseTo(-s.semiAncho, 9)
    expect(b.pos[1] - b.tam[1] / 2).toBeCloseTo(s.yLosa, 9)
    expect('desplazamientoSur' in c).toBe(false)
  })

  it('el tubo afluente va recto sobre A-A: entra a la caja a lo largo de z y termina a 1.5 m de ella', () => {
    const t = cilindro('tubo-afluente')
    expect(t.eje).toBe('z')
    expect(t.pos[0]).toBeCloseTo(0, 9)
    const p = puertoAfluente(datos)
    expect(p[0]).toBeCloseTo(0, 9)
    expect(p[1]).toBeCloseTo(-(s.semiAncho + c.ancho.valor + 1.5), 9)
    expect(t.pos[2] - t.alto / 2).toBeCloseTo(p[1], 9)
  })

  it('de la caja baja un tubo y sigue recto sobre A-A hasta el colector central', () => {
    const baja = cilindro('tubo-bajada')
    const sigue = cilindro('tubo-distribucion')
    expect(baja.pos[0]).toBeCloseTo(0, 9)
    expect(sigue.pos[0]).toBeCloseTo(0, 9)
    expect(sigue.eje).toBe('z')
    expect(sigue.pos[2] + sigue.alto / 2).toBeCloseTo(0, 9)
    expect(sigue.pos[2] - sigue.alto / 2).toBeCloseTo(baja.pos[2], 9)
    expect(sigue.pos[1]).toBeCloseTo(s.yPiso + datos.distribucion.colector.alturaSobrePiso.valor, 9)
  })

  it('el efluente va en el lado opuesto (este, +z), centrado sobre A-A, y ya no hay bloque en el extremo corto', () => {
    const e = caja('camara-efluente')
    expect(e.pos[0]).toBeCloseTo(0, 9)
    expect(e.pos[2] - e.tam[2] / 2).toBeCloseTo(s.semiAncho, 9)
    expect(e.tam[2]).toBeCloseTo(datos.efluente.anchoCamara.valor, 9)
    expect(e.tam[0]).toBeCloseTo(2 * s.semiAnchoInterior, 9)
    // Ninguna pieza de fuera sobresale por los extremos cortos del RAFA (norte y sur), salvo la vereda y su baranda (T34: huella total de 18.0 m).
    for (const p of piezas.filter((x) => x.forma === 'caja' && !['baranda', 'poste', 'pasamanos', 'vereda'].some((pre) => x.id.startsWith(pre)))) {
      if (p.forma !== 'caja') continue
      expect(Math.abs(p.pos[0]) + p.tam[0] / 2, p.id).toBeLessThanOrEqual(s.semiLargo + 1e-9)
    }
    for (let i = 1; i <= datos.efluente.salidas.valor; i++) expect(cilindro(`salida-efluente-${i}`).eje).toBe('z')
  })

  it('los lodos siguen al este (+z)', () => {
    for (const p of piezas.filter((x) => x.id.startsWith('toma-lodo-'))) expect(p.pos[2]).toBeGreaterThan(s.semiAnchoInterior)
    expect(caja('caja-muestreo').pos[2]).toBeGreaterThan(s.semiAncho)
    expect(caja('caja-descarga').pos[2]).toBeGreaterThan(s.semiAncho)
  })

  it('T08 termina en el extremo del tubo afluente (menos de 10 cm) y anota la diferencia con el plano general', () => {
    const t = tramo('T08')
    const fin = t.trazado[t.trazado.length - 1]
    const p = aPlano(puertoAfluente(datos))
    expect(Math.hypot(fin.x - p.x, fin.y - p.y)).toBeLessThan(0.1)
    expect(t.cotaLlegada.valor).toBeCloseTo(u.cotaFondo.valor + s.yLosa + c.alto.valor / 2, 2)
    expect(t.fuenteTrazado).toContain('POR CONFIRMAR')
    expect(t.fuenteTrazado).toContain('plano de detalle')
  })

  it('las etiquetas siguen a las piezas: caja y tubo al oeste, efluente y lodos al este', () => {
    const e = (id: string) => construirEtiquetas(datos, 3, 11, 11).find((x) => x.id === id)!
    expect(e('et-caja-distribucion').punta[2]).toBeLessThan(0)
    expect(Math.abs(e('et-caja-distribucion').punta[0])).toBeLessThan(1e-9)
    expect(e('et-efluente').punta[2]).toBeGreaterThan(s.semiAncho)
    expect(Math.abs(e('et-efluente').punta[0])).toBeLessThan(1e-9)
    for (const id of ['et-tomas', 'et-muestreo', 'et-descarga']) expect(e(id).punta[2], id).toBeGreaterThan(0)
  })

  it('T16.4.7: T09 arranca en el centro del muro del extremo corto norte (el más cercano a BZ-5), a menos de 10 cm, y a la altura del efluente del perfil (2985.45)', () => {
    const t = tramo('T09')
    const ini = t.trazado[0]
    const [x, z] = puertoEfluenteExtremo(datos)
    expect(x).toBeCloseTo(s.semiLargo, 9)
    expect(z).toBeCloseTo(0, 9)
    const p = aPlano([x, z])
    expect(Math.hypot(ini.x - p.x, ini.y - p.y)).toBeLessThan(0.1)
    expect(t.cotaSalida.valor).toBeCloseTo(2985.45, 2)
  })

  it('T16.4.7: el extremo corto del RAFA es el más cercano a BZ-5, y T09 sigue el plano general desde ahí hasta BZ-5', () => {
    const t = tramo('T09')
    const bz5 = conexionesCrudas.puntos.find((q) => q.id === 'BZ-5')!
    const p = aPlano(puertoEfluenteExtremo(datos))
    const sur = aPlano([-s.semiLargo, 0])
    expect(Math.hypot(p.x - bz5.x.valor, p.y - bz5.y.valor)).toBeLessThan(Math.hypot(sur.x - bz5.x.valor, sur.y - bz5.y.valor))
    expect(t.trazado.some((q) => Math.hypot(q.x + 20, q.y - 8.5) < 0.01)).toBe(true)
    expect(t.trazado[t.trazado.length - 1]).toEqual({ x: -18, y: 13.8 })
  })

  it('T16.4.7: la contradicción entre el plano de detalle (efluente en el lado largo) y el general (extremo corto) queda anotada como POR CONFIRMAR', () => {
    const t = tramo('T09')
    expect(t.fuenteTrazado).toContain('POR CONFIRMAR')
    expect(t.fuenteTrazado).toContain('plano de detalle')
    expect(t.fuenteTrazado).toContain('extremo corto')
    expect(t.cotaSalida.fuente).toContain('POR CONFIRMAR')
    expect(t.cotaSalida.fuente).toContain('Efluente')
  })
})
