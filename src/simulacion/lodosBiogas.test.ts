import { describe, expect, it } from 'vitest'
import calidad from '../../datos/calidad.json'
import crudo from '../../datos/lodosBiogas.json'
import { esquemaLodosBiogas } from './lodosBiogasEsquema'
import { produccionLodosBiogas } from './lodosBiogas'

const datos = esquemaLodosBiogas.parse(crudo)
const dqo = calidad.afluente.dqo.valor
const clon = () => structuredClone(crudo)
const diseno = datos.referenciasHoja.caudalDiseno.valor

describe('datos/lodosBiogas.json', () => {
  it('es válido, cada medida trae su fuente y apunta a una celda del Excel', () => {
    const texto = JSON.stringify(crudo)
    expect(texto).toContain('CALCULOS PTAR SANTA LEONOR.xlsx')
    for (const k of ['rendimiento', 'densidadHumedo', 'concentracionHumedo', 'densidadDeshidratado', 'concentracionDeshidratado'] as const) expect(datos.lodo[k].fuente, k).toMatch(/celda [A-Z]+\d+/)
    expect(datos.biogas.produccionEspecifica.fuente).toMatch(/celda C17/)
  })
  it('lo que es un cálculo corregido del Excel es Dato de ejemplo', () => {
    expect(datos.correccionVolumen.demo).toBe(true)
    expect(datos.correccionVolumen.fuente).toContain('factor 100')
  })
  it('rechaza datos malos: sin fuente y concentración negativa', () => {
    const sin = clon()
    sin.lodo.rendimiento.fuente = ''
    expect(esquemaLodosBiogas.safeParse(sin).success).toBe(false)
    const neg = clon()
    neg.lodo.concentracionHumedo.valor = -4
    expect(esquemaLodosBiogas.safeParse(neg).success).toBe(false)
  })
})

describe('produccionLodosBiogas', () => {
  const p = produccionLodosBiogas(datos, dqo, diseno)
  it('al caudal de diseño da lo de las hojas: carga 652.70 kg DQO/d, lodo 65.27 kg SST/d y biogás 9.2466 m3/h', () => {
    expect(p.dqoAplicada).toBeCloseTo(datos.referenciasHoja.dqoAplicada.valor, 1)
    expect(p.lodoKgDia).toBeCloseTo(datos.referenciasHoja.lodo.valor, 1)
    expect(p.biogasM3h).toBeCloseTo(datos.referenciasHoja.biogas.valor, 2)
    expect(p.biogasM3dia).toBeCloseTo(221.9, 0)
  })
  it('el volumen de lodo húmedo es 1.60 m3/d (corrección del Excel) y el deshidratado 0.249 m3/d', () => {
    expect(p.lodoHumedoM3dia).toBeCloseTo(1.5997, 3)
    expect(p.lodoDeshidratadoM3dia).toBeCloseTo(0.2486, 3)
  })
  it('las cantidades siguen al caudal: el doble de caudal da el doble, y sin caudal todo es 0', () => {
    const doble = produccionLodosBiogas(datos, dqo, diseno * 2)
    expect(doble.biogasM3dia).toBeCloseTo(p.biogasM3dia * 2, 6)
    expect(doble.lodoKgDia).toBeCloseTo(p.lodoKgDia * 2, 6)
    const cero = produccionLodosBiogas(datos, dqo, 0)
    expect([cero.biogasM3dia, cero.lodoKgDia, cero.lodoHumedoM3dia, cero.lodoDeshidratadoM3dia]).toEqual([0, 0, 0, 0])
  })
})
