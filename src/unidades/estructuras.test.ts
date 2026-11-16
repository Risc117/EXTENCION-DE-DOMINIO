import { describe, expect, it } from 'vitest'
import bombeoCrudo from '../../datos/bombeo.json'
import desarenadorCrudo from '../../datos/desarenador.json'
import parshallCrudo from '../../datos/parshall.json'
import percoladorCrudo from '../../datos/percolador.json'
import rafaCrudo from '../../datos/rafa.json'
import rejasCrudo from '../../datos/rejas.json'
import { esquemaBombeo } from './bombeo/esquema'
import { todasLasMedidas } from './comun/medidas'
import { esquemaDesarenador } from './desarenador/esquema'
import { esquemaParshall } from './parshall/esquema'
import { planta } from './planta'
import { alturaTotal as alturaPercolador } from './percolador/hidraulica'
import { esquemaPercolador } from './percolador/esquema'
import { esquemaRafa } from './rafa/esquema'
import { alturaTotal } from './rafa/hidraulica'
import { esquemaRejas } from './rejas/esquema'

const ARCHIVOS = { bombeo: bombeoCrudo, rejas: rejasCrudo, desarenador: desarenadorCrudo, parshall: parshallCrudo, rafa: rafaCrudo, percolador: percoladorCrudo }
const esquemas = { bombeo: esquemaBombeo, rejas: esquemaRejas, desarenador: esquemaDesarenador, parshall: esquemaParshall, rafa: esquemaRafa, percolador: esquemaPercolador }

describe('datos de la estación de bombeo y del pretratamiento', () => {
  it('cada archivo cumple su esquema', () => {
    for (const [id, crudo] of Object.entries(ARCHIVOS)) expect(esquemas[id as keyof typeof esquemas].safeParse(crudo).success, id).toBe(true)
  })

  it('todo valor trae su fuente, y los que dicen "Valor de ejemplo" están marcados demo: true', () => {
    for (const [id, crudo] of Object.entries(ARCHIVOS)) {
      const medidas = todasLasMedidas(crudo)
      expect(medidas.length, id).toBeGreaterThan(5)
      for (const m of medidas) {
        expect(m.fuente.length, id).toBeGreaterThan(10)
        if (m.fuente.startsWith('Valor de ejemplo')) expect(m.demo, `${id}: ${m.fuente}`).toBe(true)
        if (m.demo !== true) expect(m.fuente, id).toMatch(/xlsx|dxf|pdf|planta\.json/)
      }
    }
  })

  it('rechaza un valor sin fuente, uno negativo y una unidad equivocada', () => {
    const sinFuente = structuredClone(rejasCrudo)
    sinFuente.canal.ancho = { valor: 0.3, unidad: 'm' } as typeof rejasCrudo.canal.ancho
    expect(esquemaRejas.safeParse(sinFuente).success).toBe(false)
    const negativo = structuredClone(desarenadorCrudo)
    negativo.canal.largo.valor = -5.17
    expect(esquemaDesarenador.safeParse(negativo).success).toBe(false)
    const unidad = structuredClone(parshallCrudo)
    unidad.garganta.ancho.unidad = 'cm' as 'm'
    expect(esquemaParshall.safeParse(unidad).success).toBe(false)
  })

  it('el alto de muro de cada estructura es la coronación menos el fondo de planta.json', () => {
    const alto = (id: string) => {
      const u = planta.unidades.find((x) => x.id === id)!
      return u.cotaCoronacion.valor - u.cotaFondo.valor
    }
    expect(esquemaRejas.parse(rejasCrudo).canal.alturaMuro.valor).toBeCloseTo(alto('rejas'), 6)
    // El desarenador se dibuja con el plano (0.95 a 1.47 m, fondo con pendiente); el 1.17 m del perfil queda como diferencia por revisar.
    const canal = esquemaDesarenador.parse(desarenadorCrudo).canal
    expect([canal.alturaEntrada.valor, canal.alturaSalida.valor]).toEqual([0.95, 1.47])
    expect(canal.alturaSalida.fuente).toContain('DIFERENCIA POR REVISAR')
    expect(alto('desarenador')).toBeCloseTo(1.17, 6)
    expect(esquemaParshall.parse(parshallCrudo).estructura.alturaMuro.valor).toBeCloseTo(alto('parshall'), 6)
    expect(esquemaBombeo.parse(bombeoCrudo).carcamo.profundidad.valor).toBeCloseTo(alto('bombeo'), 6)
    // RAFA: se dibuja con el plano (7.25 m) y planta.json sube su coronación a fondo + 7.25; la cota queda POR REVISAR CON EL PERFIL.
    expect(alturaTotal(esquemaRafa.parse(rafaCrudo))).toBeCloseTo(alto('rafa'), 6)
    // Percolador: se dibuja con el plano (4.05 m); su coronación en planta.json = fondo + 4.05, por revisar con el perfil (3.06 m).
    expect(alturaPercolador(esquemaPercolador.parse(percoladorCrudo))).toBeCloseTo(alto('percolador'), 6)
  })
})
