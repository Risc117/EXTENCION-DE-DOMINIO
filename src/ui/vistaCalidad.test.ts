import { describe, expect, it } from 'vitest'
import type { EtapaCalidad } from '../estado/calidadAgua'
import { barrasParametro, filasBalance, formatoConcentracion } from './vistaCalidad'

const conc = (dbo: number, cf = 1000) => ({ dbo, dqo: dbo * 2, sst: dbo, cf })
const etapa = (id: string, entrada: number, salida: number, demo = false, cf = 1000): EtapaCalidad => ({
  id,
  entrada: conc(entrada, cf),
  salida: conc(salida, cf),
  remocion: { dbo: 1 - salida / entrada, dqo: 0, sst: 0, cf: 0 },
  demo: { dbo: demo, dqo: false, sst: false, cf: false },
})
const etapas: EtapaCalidad[] = [
  etapa('bombeo', 500, 500),
  etapa('rafa', 500, 100, true),
  etapa('percolador', 100, 15),
  etapa('sedimentador-1', 15, 15),
  etapa('sedimentador-2', 15, 15),
  etapa('salida', 15, 15),
]
const nombres = [{ id: 'rafa', nombre: 'RAFA' }, { id: 'percolador', nombre: 'Filtro percolador' }]

describe('barras de calidad por parámetro', () => {
  const b = barrasParametro(etapas, 'dbo', 100, nombres)
  it('empieza en el afluente, sigue con las etapas que remueven y termina en la salida final', () => {
    expect(b.map((x) => x.nombre)).toEqual(['Agua cruda', 'RAFA', 'Filtro percolador', 'Salida final'])
  })
  it('las barras bajan etapa por etapa (el afluente es el 100 %) y llevan su % de remoción', () => {
    expect(b[0].ancho).toBeCloseTo(100, 6)
    expect(b[1].ancho).toBeCloseTo(20, 6)
    expect(b[2].ancho).toBeCloseTo(3, 6)
    expect(b[1].remocion).toBeCloseTo(0.8, 6)
    expect(b[1].ejemplo).toBe(true)
    expect(b[2].ejemplo).toBe(false)
  })
  it('marca el límite de descarga y dice si cumple (con texto, no solo color)', () => {
    expect(b[0].cumple).toBe(false)
    expect(b[3].cumple).toBe(true)
    expect(b[3].estado).toBe('Cumple')
    expect(b[0].estado).toBe('No cumple')
    expect(b[0].limiteAncho).toBeCloseTo(20, 6)
  })
  it('los coliformes se dibujan en escala logarítmica (baja de 10⁷ a 10³ sin quedar en cero)', () => {
    const cf = barrasParametro([etapa('bombeo', 500, 500, false, 1e7), etapa('rafa', 500, 100, false, 1e3), etapa('salida', 15, 15, false, 1e3)], 'cf', 1e4, [])
    expect(cf[0].ancho).toBeCloseTo(100, 6)
    expect(cf[cf.length - 1].ancho).toBeCloseTo((3 / 7) * 100, 4)
  })
})

describe('formato de concentraciones', () => {
  it('pocas cifras en mg/L y notación científica en los coliformes grandes', () => {
    expect(formatoConcentracion(577.91, 'dbo')).toBe('577.9')
    expect(formatoConcentracion(5.779, 'dbo')).toBe('5.78')
    expect(formatoConcentracion(2311.6, 'cf')).toBe('2312')
    expect(formatoConcentracion(23116273.4, 'cf')).toBe('2.31×10⁷')
  })
})

describe('tabla de balance por unidad', () => {
  const filas = filasBalance(etapas, { rafa: { entrada: 6.5, salida: 6.5 }, percolador: { entrada: 6.5, salida: 6.4 } }, nombres)
  it('una fila por unidad con el caudal en vivo y las concentraciones de entrada y salida', () => {
    expect(filas).toHaveLength(etapas.length)
    const rafa = filas.find((f) => f.id === 'rafa')!
    expect(rafa.nombre).toBe('RAFA')
    expect(rafa.caudalEntra).toBe('6.50')
    expect(rafa.parametros.dbo).toEqual({ entra: '500.0', sale: '100.0', remocion: '80 %' })
  })
  it('la carga de DBO que sale sigue al caudal (kg/d)', () => {
    const perco = filas.find((f) => f.id === 'percolador')!
    expect(perco.cargaDboSale).toBe('8.29') // 15 mg/L × 6.4 L/s × 0.0864
  })
  it('sin caudal todavía muestra una raya', () => {
    expect(filas.find((f) => f.id === 'bombeo')!.caudalEntra).toBe('—')
    expect(filas.find((f) => f.id === 'bombeo')!.cargaDboSale).toBe('—')
  })
})
