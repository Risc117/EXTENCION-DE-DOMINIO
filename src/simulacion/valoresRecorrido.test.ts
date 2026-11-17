import { describe, expect, it } from 'vitest'
import crudo from '../../datos/demo.json'
import planta from '../../datos/planta.json'
import { crearGuion, textoConValores } from './guion'
import { valoresPlanta } from './valoresRecorrido'

describe('valores de la demo de toda la planta (salen de los datos)', () => {
  const v = valoresPlanta()
  it('los caudales son los de diseño', () => {
    expect(v.qp).toBe(6.536)
    expect(v.qmh).toBe(13.072)
  })
  it('la calidad sigue la cadena RAFA + percolador: 577.91 → 121.88 → 15.0 mg/L de DBO', () => {
    expect(v.dboEntrada).toBeCloseTo(577.91, 2)
    expect(v.dboRafa).toBeCloseTo(121.88, 2)
    expect(v.dboFinal).toBeCloseTo(15, 1)
    expect(v.remocionRafa).toBeCloseTo(78.91, 1)
    expect(v.remocionTotal).toBeCloseTo(97.4, 1)
  })
  it('el lodo es el del panel de lodos y biogás (65.27 kg de sólidos por día) y el biogás sale de la fórmula de la hoja', () => {
    expect(v.lodoKgDia).toBeCloseTo(65.27, 1)
    expect(v.biogas).toBeGreaterThan(200)
    expect(v.biogas).toBeLessThan(300)
  })
  it('los lechos de secado miden 170.17 m²', () => {
    expect(v.lechosArea).toBeCloseTo(170.17, 2)
  })
})

describe('guion del recorrido de toda la planta', () => {
  const pasos = crearGuion(crudo)
  it('tiene 15 pasos: 4 de entrada, los 5 del tanque y 6 de salida', () => {
    expect(pasos).toHaveLength(15)
  })
  it('sigue el orden del tren de tratamiento y cada unidad enfocada existe en la planta', () => {
    const ids = planta.unidades.map((u) => u.id)
    const focos = pasos.map((p) => p.foco)
    for (const f of focos) if (typeof f === 'string') expect(ids).toContain(f)
    const orden = ['rejas', 'desarenador', 'parshall', undefined, 'rafa', 'percolador', 'sedimentador-1', 'camara-contacto', 'lechos-secado']
    const vistos = focos.filter((f, i) => f !== null && (f !== undefined || focos[i - 1] !== undefined))
    expect(vistos).toEqual(orden)
  })
  it('empieza y termina en la vista general (foco null)', () => {
    expect(pasos[0].foco).toBeNull()
    expect(pasos[pasos.length - 1].foco).toBeNull()
  })
  it('los marcadores de todos los textos se llenan con los datos (los del tanque con valoresDemo y los de la planta con valoresPlanta)', () => {
    const v = valoresPlanta()
    for (const p of pasos.filter((x) => x.foco !== undefined)) {
      expect(textoConValores(p.texto, v)).not.toMatch(/[{}]/)
      expect(textoConValores(p.titulo, v)).not.toMatch(/[{}]/)
    }
  })
  it('el texto de RAFA y el del cierre dicen las cifras de los datos', () => {
    const v = valoresPlanta()
    const rafa = pasos.find((p) => p.foco === 'rafa')!
    expect(textoConValores(rafa.texto, v)).toContain('578 a 122 mg/L')
    expect(textoConValores(rafa.texto, v)).toContain('79 %')
    const cierre = pasos[pasos.length - 1]
    expect(textoConValores(cierre.texto, v)).toContain('97 %')
  })
})
