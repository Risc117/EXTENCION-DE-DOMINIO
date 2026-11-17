import { describe, expect, it } from 'vitest'
import calidad from '../../datos/calidad.json'
import { useMezclaRio } from '../estado/mezclaRio'
import { MEZCLA_PARAMETROS, cumpleLimite, diferenciasDescarga, esquemaMezcla, evaluarMezcla, mezclaRio, publicarMezclaRio } from './mezclaRio'

describe('datos de la mezcla con el río (memoria, sección 18)', () => {
  it('todo valor trae la fuente "sección 18" y no es de ejemplo', () => {
    const valores = [
      ...Object.values(mezclaRio.descarga),
      ...mezclaRio.escenarios.flatMap((e) => [e.caudalRio, ...Object.values(e.mezcla)]),
      ...Object.values(mezclaRio.limites.eca),
      ...Object.values(mezclaRio.limites.lmp),
    ]
    expect(valores.length).toBe(5 + 2 * 6 + 4 + 4)
    for (const v of valores) {
      expect(v.fuente).toContain('sección 18')
      expect(v.demo).toBe(false)
    }
  })
  it('tiene los caudales del río y las concentraciones de la memoria', () => {
    const [estiaje, lluvia] = mezclaRio.escenarios
    expect(estiaje.caudalRio.valor).toBe(1698.8)
    expect(lluvia.caudalRio.valor).toBe(19043.04)
    expect(mezclaRio.descarga).toMatchObject({ dbo: { valor: 5.78 }, dqo: { valor: 52.01 }, sst: { valor: 10.4 }, cf: { valor: 2311.63 }, od: { valor: 4 } })
    expect(estiaje.mezcla).toMatchObject({ dbo: { valor: 1 }, dqo: { valor: 6 }, sst: { valor: 37 }, cf: { valor: 23 }, od: { valor: 8.5 } })
    expect(lluvia.mezcla).toMatchObject({ dbo: { valor: 3 }, dqo: { valor: 6 }, sst: { valor: 399 }, cf: { valor: 25000 }, od: { valor: 10.25 } })
  })
  it('los límites coinciden con los de datos/calidad.json (LMP y ECA)', () => {
    for (const p of ['dbo', 'dqo', 'sst', 'cf'] as const) expect(mezclaRio.limites.lmp[p].valor).toBe(calidad.limites.descarga[p].valor)
    for (const p of ['dbo', 'dqo', 'cf'] as const) expect(mezclaRio.limites.eca[p].valor).toBe(calidad.limites.eca[p].valor)
  })
  it('el esquema rechaza un valor sin fuente, un caudal en cero y un escenario repetido', () => {
    const a = structuredClone(mezclaRio)
    a.descarga.dbo.fuente = ''
    expect(esquemaMezcla.safeParse(a).success).toBe(false)
    const b = structuredClone(mezclaRio)
    b.escenarios[0].caudalRio.valor = 0
    expect(esquemaMezcla.safeParse(b).success).toBe(false)
    const c = structuredClone(mezclaRio)
    c.escenarios[1].id = 'estiaje'
    expect(esquemaMezcla.safeParse(c).success).toBe(false)
  })
})

describe('cumplimiento de un límite', () => {
  it('un máximo se cumple hasta el valor y un mínimo desde el valor', () => {
    expect(cumpleLimite(15, { valor: 15, tipo: 'maximo' })).toBe(true)
    expect(cumpleLimite(15.01, { valor: 15, tipo: 'maximo' })).toBe(false)
    expect(cumpleLimite(5, { valor: 5, tipo: 'minimo' })).toBe(true)
    expect(cumpleLimite(4.99, { valor: 5, tipo: 'minimo' })).toBe(false)
  })
})

describe('evaluación de la mezcla en estiaje y en lluvia', () => {
  const fila = (id: string, p: (typeof MEZCLA_PARAMETROS)[number]) => evaluarMezcla(mezclaRio, id).find((f) => f.parametro === p)!
  it('en estiaje todo cumple (lo que la memoria llama "Cumple")', () => {
    for (const f of evaluarMezcla(mezclaRio, 'estiaje')) {
      if (f.eca) expect(f.eca.cumple, `ECA ${f.parametro}`).toBe(true)
      if (f.lmp) expect(f.lmp.cumple, `LMP ${f.parametro}`).toBe(true)
    }
  })
  it('en lluvia los sólidos superan el LMP (399 > 150) y los coliformes superan el ECA (25 000 > 1 000) y el LMP (> 10 000)', () => {
    expect(fila('lluvia', 'sst').lmp).toMatchObject({ valor: 150, cumple: false })
    expect(fila('lluvia', 'sst').eca).toBeNull()
    expect(fila('lluvia', 'cf').eca).toMatchObject({ valor: 1000, cumple: false })
    expect(fila('lluvia', 'cf').lmp).toMatchObject({ valor: 10000, cumple: false })
    expect(fila('lluvia', 'dbo').eca?.cumple).toBe(true)
    expect(fila('lluvia', 'od').eca).toMatchObject({ valor: 5, cumple: true })
  })
  it('el oxígeno disuelto no tiene límite de descarga (LMP)', () => {
    expect(fila('estiaje', 'od').lmp).toBeNull()
  })
  it('un escenario que no existe falla con un mensaje claro', () => {
    expect(() => evaluarMezcla(mezclaRio, 'sequia')).toThrow(/sequia/)
  })
})

describe('diferencia entre la descarga de la memoria y la cadena del visor', () => {
  const visor = { dbo: 15, dqo: 101.81, sst: 10.4, cf: 2311.6 }
  const dif = diferenciasDescarga(mezclaRio, visor)
  it('muestra ambas cifras y su diferencia, sin ocultar la de DBO ni la de DQO', () => {
    const dbo = dif.find((d) => d.parametro === 'dbo')!
    expect(dbo.memoria).toBe(5.78)
    expect(dbo.visor).toBe(15)
    expect(dbo.diferencia).toBeCloseTo(9.22, 9)
    expect(dbo.veces).toBeCloseTo(15 / 5.78, 9)
    expect(dif.find((d) => d.parametro === 'dqo')!.diferencia).toBeCloseTo(49.8, 9)
  })
  it('los sólidos y los coliformes coinciden (diferencia menor de 0.1 %)', () => {
    expect(dif.find((d) => d.parametro === 'sst')!.coincide).toBe(true)
    expect(dif.find((d) => d.parametro === 'cf')!.coincide).toBe(true)
    expect(dif.find((d) => d.parametro === 'dbo')!.coincide).toBe(false)
  })
})

describe('publicación para la interfaz', () => {
  it('publica los dos escenarios y las diferencias con la salida final de la cadena', () => {
    publicarMezclaRio({ dbo: 15, dqo: 101.81, sst: 10.4, cf: 2311.6 })
    const e = useMezclaRio.getState()
    expect(e.escenarios.map((x) => x.id)).toEqual(['estiaje', 'lluvia'])
    expect(e.escenarios[1].caudalRio).toBe(19043.04)
    expect(e.escenarios[0].filas).toHaveLength(5)
    expect(e.diferencias.find((d) => d.parametro === 'dbo')?.diferencia).toBeCloseTo(9.22, 9)
    expect(e.fuente).toContain('sección 18')
  })
})
