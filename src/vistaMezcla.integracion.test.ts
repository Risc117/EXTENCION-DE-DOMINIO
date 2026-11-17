import { describe, expect, it } from 'vitest'
import { publicarMezclaRio } from './simulacion/mezclaRio'
import { useMezclaRio } from './estado/mezclaRio'
import { formatoDosDecimales, vistaDiferencias, vistaEscenarios } from './ui/vistaMezcla'

publicarMezclaRio({ dbo: 15, dqo: 101.81, sst: 10.4, cf: 2311.6 })

describe('vista de la mezcla con el río', () => {
  it('da formato a los números: dos decimales y miles con espacio', () => {
    expect(formatoDosDecimales(1698.8)).toBe('1 698.80')
    expect(formatoDosDecimales(19043.04)).toBe('19 043.04')
    expect(formatoDosDecimales(5.78)).toBe('5.78')
  })
  const [estiaje, lluvia] = vistaEscenarios(useMezclaRio.getState().escenarios)
  it('titula cada escenario con el caudal del río', () => {
    expect(estiaje.titulo).toBe('Estiaje: río con 1 698.80 L/s')
    expect(lluvia.titulo).toBe('Lluvia: río con 19 043.04 L/s')
  })
  it('en estiaje cumple todo y lo dice', () => {
    expect(estiaje.cumpleTodo).toBe(true)
    expect(estiaje.resumen).toBe('Cumple todos los límites.')
  })
  it('en lluvia dice qué no cumple y contra qué límite (SST contra el LMP; coliformes contra el ECA y el LMP)', () => {
    expect(lluvia.cumpleTodo).toBe(false)
    expect(lluvia.resumen).toContain('SST (mg/L) (LMP < 150.00)')
    expect(lluvia.resumen).toContain('Coliformes (NMP/100 mL) (ECA < 1000)')
    expect(lluvia.resumen).toContain('Coliformes (NMP/100 mL) (LMP < 10000)')
    expect(lluvia.resumen).not.toContain('DBO')
  })
  it('las filas traen descarga, mezcla y el estado con icono y texto (no solo color)', () => {
    const sst = lluvia.filas.find((f) => f.parametro.startsWith('SST'))!
    expect(sst.descarga).toBe('10.40')
    expect(sst.mezcla).toBe('399.00')
    expect(sst.eca).toBeNull()
    expect(sst.lmp).toMatchObject({ limite: '< 150.00', cumple: false, estado: '✕ No cumple' })
    const od = lluvia.filas.find((f) => f.parametro.startsWith('Oxígeno'))!
    expect(od.eca).toMatchObject({ limite: '≥ 5.00', cumple: true, estado: '✓ Cumple' })
    expect(od.lmp).toBeNull()
  })
})

describe('vista de la diferencia entre la memoria y el visor', () => {
  const dif = vistaDiferencias(useMezclaRio.getState().diferencias)
  it('muestra ambas cifras y la diferencia de DBO y DQO', () => {
    const dbo = dif.find((d) => d.parametro.startsWith('DBO'))!
    expect(dbo).toMatchObject({ memoria: '5.78', visor: '15.00', diferencia: '+9.22', veces: '2.6 veces', coincide: false })
    expect(dif.find((d) => d.parametro.startsWith('DQO'))).toMatchObject({ memoria: '52.01', visor: '101.81', diferencia: '+49.80' })
  })
  it('dice "coinciden" en sólidos y coliformes', () => {
    expect(dif.find((d) => d.parametro.startsWith('SST'))).toMatchObject({ diferencia: 'coinciden', veces: null })
    expect(dif.find((d) => d.parametro.startsWith('Coliformes'))?.coincide).toBe(true)
  })
})
