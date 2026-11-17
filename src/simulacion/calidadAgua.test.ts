import { describe, expect, it } from 'vitest'
import crudo from '../../datos/calidad.json'
import linea from '../../datos/linea.json'
import { balanceCalidad, cargaKgDia, cumpleLimite, PARAMETROS } from './calidadAgua'
import { esquemaCalidad, etapasSinUnidad } from './calidadEsquema'
import { esquemaLinea } from './lineaEsquema'

const datos = esquemaCalidad.parse(crudo)
const nodos = esquemaLinea.parse(linea).nodos
const balance = Object.fromEntries(balanceCalidad(datos, nodos).map((e) => [e.id, e]))
const clon = () => structuredClone(crudo)

/** Todas las medidas (objetos con valor y fuente) que cuelgan de un objeto de datos (la capa simulacion no importa de unidades). */
function todasLasMedidas(d: unknown): { valor: number; fuente: string; demo?: boolean }[] {
  if (typeof d !== 'object' || d === null) return []
  const o = d as Record<string, unknown>
  if (typeof o.valor === 'number' && typeof o.fuente === 'string') return [o as { valor: number; fuente: string; demo?: boolean }]
  return Object.values(o).flatMap(todasLasMedidas)
}

describe('datos/calidad.json', () => {
  it('es válido y cada medida trae su fuente', () => {
    const medidas = todasLasMedidas(datos)
    expect(medidas.length).toBeGreaterThan(40)
    for (const m of medidas) expect(m.fuente.length).toBeGreaterThan(10)
  })
  it('tiene una etapa por cada unidad de la línea de agua, y ninguna de más', () => {
    expect(etapasSinUnidad(datos, nodos.map((n) => n.id))).toEqual({ sinEtapa: [], sobran: [] })
  })
  it('lo que no sale de las hojas es Dato de ejemplo', () => {
    for (const m of todasLasMedidas(datos)) if (/^(No está en|Estimación)/.test(m.fuente)) expect(m.demo, m.fuente).toBe(true)
    const e = (id: string) => datos.etapas.find((x) => x.id === id)!.remocion
    expect(e('rafa').sst.demo).toBe(true)
    expect(e('rafa').cf.demo).toBe(true)
    expect(e('percolador').dqo.demo).toBe(true)
    expect(e('sedimentador-1').sst.demo).toBe(true)
    expect(e('rafa').dbo.demo).toBe(false)
    expect(e('percolador').dbo.demo).toBe(false)
    expect(e('camara-contacto').cf.demo).toBe(false)
  })
  it('explica cómo se estimó lo que falta', () => {
    expect(datos.metodo).toContain('BALANCE')
    expect(datos.metodo).toContain('CALCULOS')
  })
  it('rechaza datos malos: sin fuente, eficiencia fuera de 0 a 1 y etapas repetidas', () => {
    const sin = clon()
    sin.afluente.dbo.fuente = ''
    expect(esquemaCalidad.safeParse(sin).success).toBe(false)
    const mala = clon()
    mala.etapas[0].remocion.dbo.valor = 1.5
    expect(esquemaCalidad.safeParse(mala).success).toBe(false)
    const rep = clon()
    rep.etapas[1].id = rep.etapas[0].id
    expect(esquemaCalidad.safeParse(rep).success).toBe(false)
  })
})

describe('balance de calidad por unidad', () => {
  it('la entrada de la primera unidad es el afluente', () => {
    expect(balance.bombeo.entrada.dbo).toBeCloseTo(577.91, 6)
    expect(balance.bombeo.entrada.cf).toBeCloseTo(23116273.4, 0)
  })
  it('coincide con las hojas: DBO 121.88 tras el RAFA y 15.0 tras el percolador', () => {
    expect(balance.percolador.entrada.dbo).toBeCloseTo(121.884, 2)
    expect(balance.percolador.salida.dbo).toBeCloseTo(15, 2)
    expect(balance.rafa.remocion.dbo).toBeCloseTo(0.7891, 4)
    expect(balance.rafa.salida.dqo).toBeCloseTo(339.38, 1)
  })
  it('al final: DBO 15.0, DQO 101.8, SST 10.40 y coliformes 2311.6 (como el BALANCE para SST y coliformes)', () => {
    const f = balance.salida.entrada
    expect(f.dbo).toBeCloseTo(15, 2)
    expect(f.dqo).toBeCloseTo(101.81, 1)
    expect(f.sst).toBeCloseTo(10.4, 1)
    expect(f.cf).toBeCloseTo(2311.6, 0)
  })
  it('las dos ramas de los sedimentadores se juntan con el promedio ponderado por caudal', () => {
    const nodosPrueba = [
      { id: 'a', destinos: [{ id: 'b', fraccion: 0.3 }, { id: 'c', fraccion: 0.7 }] },
      { id: 'b', destinos: [{ id: 'd', fraccion: 1 }] },
      { id: 'c', destinos: [{ id: 'd', fraccion: 1 }] },
      { id: 'd', destinos: [] },
    ]
    const r = (valor: number) => ({ dbo: { valor, unidad: 'fraccion' as const, fuente: 'prueba' }, dqo: { valor: 0, unidad: 'fraccion' as const, fuente: 'prueba' }, sst: { valor: 0, unidad: 'fraccion' as const, fuente: 'prueba' }, cf: { valor: 0, unidad: 'fraccion' as const, fuente: 'prueba' } })
    const d = { ...datos, etapas: [{ id: 'a', remocion: r(0) }, { id: 'b', remocion: r(0.5) }, { id: 'c', remocion: r(0) }, { id: 'd', remocion: r(0) }] }
    const b = Object.fromEntries(balanceCalidad(d, nodosPrueba).map((e) => [e.id, e]))
    expect(b.d.entrada.dbo).toBeCloseTo(0.85 * 577.91, 6)
  })
  it('PARAMETROS son DBO, DQO, SST y coliformes', () => {
    expect([...PARAMETROS]).toEqual(['dbo', 'dqo', 'sst', 'cf'])
  })
})

describe('límites y cargas', () => {
  it('compara con el límite de descarga: cumple si no lo supera', () => {
    expect(cumpleLimite(15, datos.limites.descarga.dbo.valor)).toBe(true)
    expect(cumpleLimite(100, 100)).toBe(true)
    expect(cumpleLimite(100.1, 100)).toBe(false)
    expect(cumpleLimite(2311.6, datos.limites.descarga.cf.valor)).toBe(true)
  })
  it('la carga en kg/d sigue al caudal: 15 mg/L × 6.536 L/s = 8.47 kg/d', () => {
    expect(cargaKgDia(15, 6.536)).toBeCloseTo(8.47, 2)
    expect(cargaKgDia(15, 0)).toBe(0)
  })
})
