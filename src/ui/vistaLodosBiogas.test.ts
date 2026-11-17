import { describe, expect, it } from 'vitest'
import { TEXTO_DATO_EJEMPLO } from '../nucleo/constantes'
import type { DatosLodosVivo, ProduccionVivo } from '../estado/lodosBiogas'
import { filasLodosBiogas } from './vistaLodosBiogas'

const produccion: ProduccionVivo = { biogasM3dia: 221.9, biogasM3h: 9.2466, lodoKgDia: 65.27, lodoHumedoM3dia: 1.5997, lodoDeshidratadoM3dia: 0.2486 }
const datos: DatosLodosVivo = { concentracionHumedo: 4, concentracionDeshidratado: 25, lechosAreaM2: 170.1677, lechosCicloDias: 42, biogasDisenoM3h: 9.2466, volumenEsEjemplo: true }
const texto = () => filasLodosBiogas(produccion, datos).map((f) => `${f.etiqueta}: ${f.valor}`)

describe('filas del panel de lodos y biogás', () => {
  it('muestra el biogás al quemador y el lodo del RAFA por día, como en la hoja', () => {
    expect(texto()).toContain('Biogás al quemador: 221.9 m³/d (9.25 m³/h)')
    expect(texto()).toContain('Lodo del RAFA (sólidos): 65.27 kg SST/d')
  })
  it('los volúmenes de lodo son un cálculo corregido: llevan "Dato de ejemplo"', () => {
    expect(texto()).toContain(`Lodo húmedo (4 % de sólidos): 1.60 m³/d · ${TEXTO_DATO_EJEMPLO}`)
    expect(texto()).toContain(`Lodo deshidratado (25 % de sólidos): 0.249 m³/d · ${TEXTO_DATO_EJEMPLO}`)
  })
  it('dice a dónde va el lodo (lechos de secado con su área y ciclo) y que los sedimentadores no tienen dato', () => {
    expect(texto()).toContain('Lechos de secado: 170.2 m² · ciclo de 42 días')
    expect(texto().join('|')).toContain('Sedimentadores secundarios: sin dato en las hojas')
  })
  it('no muestra la diferencia de sólidos ni cifras del balance viejo', () => {
    const todo = texto().join('|')
    for (const prohibido of ['516', '581', '582', 'diferencia', 'subdimension']) expect(todo, prohibido).not.toContain(prohibido)
  })
  it('sin datos todavía no hay filas', () => {
    expect(filasLodosBiogas(null, datos)).toEqual([])
    expect(filasLodosBiogas(produccion, null)).toEqual([])
  })
})
