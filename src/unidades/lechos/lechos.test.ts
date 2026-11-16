import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/lechos.json'
import { todasLasMedidas } from '../comun/medidas'
import { planta } from '../planta'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { disponer } from './disposicion'
import { esquemaLechos } from './esquema'
import { construirPiezas } from './geometria'
import { anchoExterior, areaPlano, espesorCapas, largoExterior, mitadAncho, nivelLodo, pendienteGrados } from './hidraulica'

const datos = esquemaLechos.parse(crudo)
const clon = () => structuredClone(crudo)
const piezas = construirPiezas(datos, false, 0.1)
const por = (id: string, ps = piezas) => ps.find((p) => p.id === id)!
const caja = (id: string, ps = piezas) => {
  const p = por(id, ps)
  if (p.forma !== 'caja') throw new Error(`${id} debe ser una caja`)
  return p
}

describe('datos/lechos.json', () => {
  it('es válido y cada medida trae su fuente', () => {
    const medidas = todasLasMedidas(datos)
    expect(medidas.length).toBeGreaterThan(25)
    for (const m of medidas) expect(m.fuente.length).toBeGreaterThan(5)
  })

  it('el plano y la hoja no son de ejemplo; lo que no está en las fuentes sí, y la cantidad de lechos va por confirmar', () => {
    for (const m of [datos.lecho.anchoInterior, datos.lecho.largoInterior, datos.muro.espesor, datos.dren.ancho, datos.dren.diametroTuberia, datos.capas.arena.espesor, datos.capas.ladrillo.espesor, datos.hoja.cicloDias]) expect(m.demo, m.fuente).not.toBe(true)
    for (const m of [datos.muro.alturaSobreTerreno, datos.dren.profundidad, datos.dren.espesorPared, datos.piso.pendiente, datos.lodo.alturaMaxima, datos.lecho.cantidad]) expect(m.demo).toBe(true)
    expect(datos.lecho.cantidad.valor).toBe(1)
    expect(datos.lecho.cantidad.fuente).toContain('POR CONFIRMAR CON EL USUARIO')
  })

  it('11.00 + 2 × 0.20 = 11.40, 15.00 + 2 × 0.20 = 15.40 y 5.30 desde el exterior = 0.20 + 5.10', () => {
    expect(anchoExterior(datos)).toBeCloseTo(11.4, 9)
    expect(largoExterior(datos)).toBeCloseTo(15.4, 9)
    expect(mitadAncho(datos)).toBeCloseTo(5.1, 9)
    expect(areaPlano(datos)).toBeCloseTo(165, 9)
  })

  it('las 5 capas suman la profundidad h = 0.40 de la hoja', () => {
    expect(espesorCapas(datos)).toBeCloseTo(0.4, 9)
  })

  it('rechaza medidas que no cuadran, capas que no suman, cantidad 0 o decimal, valores malos y falta de fuente', () => {
    const ancho = clon()
    ancho.lecho.anchoInterior.valor = 12
    expect(esquemaLechos.safeParse(ancho).success).toBe(false)
    const capas = clon()
    capas.capas.arena.espesor.valor = 0.2
    expect(esquemaLechos.safeParse(capas).success).toBe(false)
    const cero = clon()
    cero.lecho.cantidad.valor = 0
    expect(esquemaLechos.safeParse(cero).success).toBe(false)
    const medio = clon()
    medio.lecho.cantidad.valor = 1.5
    expect(esquemaLechos.safeParse(medio).success).toBe(false)
    const neg = clon()
    neg.muro.espesor.valor = -0.2
    expect(esquemaLechos.safeParse(neg).success).toBe(false)
    const sin = clon()
    sin.dren.ancho.fuente = ''
    expect(esquemaLechos.safeParse(sin).success).toBe(false)
    const dren = clon()
    dren.dren.ancho.valor = 12
    expect(esquemaLechos.safeParse(dren).success).toBe(false)
  })

  it('el alto de planta.json (coronación − fondo) es la profundidad h y ya no hay marcador', () => {
    const u = planta.unidades.find((x) => x.id === 'lechos-secado')!
    expect(u.cotaCoronacion.valor - u.cotaFondo.valor).toBeCloseTo(datos.hoja.profundidad.valor, 6)
    expect(u.marcador).toBeUndefined()
  })
})

describe('geometría del lecho', () => {
  it('tiene piso, 4 muros, las 5 capas, el dren con su tubería y las tapas', () => {
    for (const id of ['muro-1-a', 'muro-1-b', 'muro-1-c', 'muro-1-d', 'piso-1-der', 'piso-1-izq', 'piso-dren-1', 'tubo-dren-1', 'tapa-1-1']) expect(por(id), id).toBeDefined()
    for (const c of ['gravaGruesa', 'gravaMedia', 'gravaFina', 'arena', 'ladrillo']) for (const lado of ['der', 'izq']) expect(por(`capa-1-${c}-${lado}`), c).toBeDefined()
  })

  it('el muro de contorno mide 11.40 × 15.40 por fuera', () => {
    const ids = piezas.filter((p) => p.id.startsWith('muro-1')).map((p) => caja(p.id))
    const xs = ids.flatMap((p) => [p.pos[0] - p.tam[0] / 2, p.pos[0] + p.tam[0] / 2])
    const zs = ids.flatMap((p) => [p.pos[2] - p.tam[2] / 2, p.pos[2] + p.tam[2] / 2])
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(11.4, 9)
    expect(Math.max(...zs) - Math.min(...zs)).toBeCloseTo(15.4, 9)
  })

  it('las capas van en orden de abajo hacia arriba: gruesa, media, fina, arena y ladrillo, con su espesor', () => {
    const y = (c: string) => caja(`capa-1-${c}-der`)
    const orden = ['gravaGruesa', 'gravaMedia', 'gravaFina', 'arena', 'ladrillo']
    for (let i = 1; i < orden.length; i++) expect(y(orden[i]).pos[1]).toBeGreaterThan(y(orden[i - 1]).pos[1])
    expect(y('arena').tam[1]).toBeCloseTo(0.1, 9)
    expect(y('gravaFina').tam[1]).toBeCloseTo(0.05, 9)
    expect(y('ladrillo').pos[1] + y('ladrillo').tam[1] / 2).toBeCloseTo(0.4, 9)
  })

  it('el piso baja hacia el dren: las dos mitades se inclinan al revés y suben 5.10 × 1 % hacia los muros', () => {
    const der = caja('capa-1-ladrillo-der').inclinacion!
    const izq = caja('capa-1-ladrillo-izq').inclinacion!
    expect(der.angulo).toBeGreaterThan(0)
    expect(izq.angulo).toBeCloseTo(-der.angulo, 9)
    expect(Math.tan(der.angulo) * mitadAncho(datos)).toBeCloseTo(0.051, 3)
    expect(pendienteGrados(datos)).toBeCloseTo((der.angulo * 180) / Math.PI, 9)
  })

  it('el dren mide 0.80 m de ancho y las tapas se repiten cada 0.50 m', () => {
    expect(caja('piso-dren-1').tam[0]).toBeCloseTo(0.8 - 2 * datos.dren.espesorPared.valor, 9)
    const tapas = piezas.filter((p) => p.id.startsWith('tapa-1-'))
    expect(tapas.length).toBe(30)
    expect(tapas.every((t) => t.accesorio)).toBe(true)
    expect(Math.abs(caja('tapa-1-2').pos[2] - caja('tapa-1-1').pos[2])).toBeCloseTo(0.5, 9)
  })

  it('los muros son opacos y solo se vuelven translúcidos con "Ver corte"', () => {
    expect(por('muro-1-a', construirPiezas(datos, false, 0)).opacidad).toBeUndefined()
    expect(por('muro-1-a', construirPiezas(datos, true, 0)).opacidad).toBeLessThan(1)
  })

  it('el muro sobresale del terreno lo que dice el JSON', () => {
    const m = caja('muro-1-a')
    expect(m.pos[1] + m.tam[1] / 2).toBeCloseTo(0.4 + 0.3, 9)
  })

  it('cambiar una medida del JSON cambia la pieza', () => {
    const otro = clon()
    otro.muro.alturaSobreTerreno.valor = 0.6
    const m = caja('muro-1-a', construirPiezas(esquemaLechos.parse(otro), false, 0))
    expect(m.pos[1] + m.tam[1] / 2).toBeCloseTo(1.0, 9)
  })

  it('la cantidad de lechos es un campo del JSON: con 2 se arman dos lechos lado a lado sin cruzarse', () => {
    const dos = clon()
    dos.lecho.cantidad.valor = 2
    const d2 = esquemaLechos.parse(dos)
    const ps = construirPiezas(d2, false, 0)
    expect(ps.filter((p) => p.id.startsWith('muro-')).length).toBe(8)
    const x1 = caja('muro-1-a', ps).pos[0]
    const x2 = caja('muro-2-a', ps).pos[0]
    expect(Math.abs(x2 - x1)).toBeCloseTo(anchoExterior(d2) + d2.lecho.separacion.valor, 9)
    expect(disponer(d2).anchoConjunto).toBeCloseTo(2 * 11.4 + 1, 9)
  })
})

describe('lodo', () => {
  it('sube durante el secado (4 semanas) y baja durante la remoción (2 semanas) a lo largo del ciclo', () => {
    const h = datos.lodo.horasPorCiclo.valor
    expect(nivelLodo(datos, 0)).toBe(0)
    expect(nivelLodo(datos, h * (4 / 6))).toBeCloseTo(0.25, 9)
    expect(nivelLodo(datos, h * (2 / 6))).toBeCloseTo(0.125, 9)
    expect(nivelLodo(datos, h * (5 / 6))).toBeCloseTo(0.125, 9)
    expect(nivelLodo(datos, h)).toBeCloseTo(0, 9)
  })

  it('la pieza de lodo crece con el nivel y no existe sin lodo', () => {
    expect(construirPiezas(datos, false, 0).some((p) => p.id.startsWith('lodo'))).toBe(false)
    expect(caja('lodo-1-der', construirPiezas(datos, false, 0.2)).tam[1]).toBeCloseTo(0.2, 9)
  })
})

describe('anotaciones', () => {
  it('las cotas salen de las medidas', () => {
    const c = construirCotas(datos).map((x) => x.texto)
    expect(c).toContain('Ancho interior = 11.00 m')
    expect(c).toContain('Largo interior = 15.00 m')
    expect(c).toContain('Dren central = 0.80 m')
    expect(c).toContain('Profundidad h = 0.40 m')
  })

  it('las etiquetas dicen el ladrillo, la cantidad por confirmar y las dos áreas; lo estimado lleva "(ej.)"', () => {
    const t = construirEtiquetas(datos, 3).map((e) => e.texto)
    expect(t.some((x) => x.includes('10 × 20 × 10 cm') && !x.includes('(ej.)'))).toBe(true)
    expect(t.some((x) => x.includes('165.00') && x.includes('170.17'))).toBe(true)
    expect(t.some((x) => x.includes('Lechos: 1') && x.includes('(ej.)'))).toBe(true)
    expect(t.some((x) => x.includes('Tapas') && x.includes('(ej.)'))).toBe(true)
    expect(t.some((x) => x.includes('Muros de concreto') && !x.includes('(ej.)'))).toBe(true)
    expect(t.some((x) => x.includes('Lodo') && x.includes('(ej.)'))).toBe(true)
  })
})
