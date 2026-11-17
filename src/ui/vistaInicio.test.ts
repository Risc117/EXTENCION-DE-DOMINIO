import { describe, expect, it } from 'vitest'
import escala from '../../datos/escalaCaudal.json'
import planta from '../../datos/planta.json'
import { esquemaInicio } from '../nucleo/inicioEsquema'
import { inicio } from './datosInicio'
import { formatoNumero, vistaInicio } from './vistaInicio'

describe('datos de la pantalla de inicio (memoria descriptiva)', () => {
  it('todo valor trae su fuente y ninguno es de ejemplo', () => {
    const valores = [inicio.ubicacion.altitud, inicio.poblacion.base, inicio.poblacion.proyectada, ...Object.values(inicio.caudales)]
    for (const v of valores) {
      expect(v.fuente).toContain('resumen-memoria.md')
      expect(v.demo).toBe(false)
    }
  })
  it('los caudales coinciden con los de diseño de la simulación (Qp y Qmh de datos/escalaCaudal.json)', () => {
    expect(inicio.caudales.qp.valor).toBe(escala.caudalPromedio.valor)
    expect(inicio.caudales.qmh.valor).toBe(escala.caudalMaximoHorario.valor)
    expect(inicio.caudales.qmd.valor).toBeCloseTo(8.496, 3)
    expect(inicio.caudales.qmin.valor).toBeCloseTo(3.268, 3)
  })
  it('la ubicación no dice la provincia (Huaral o Huaura) y lo deja anotado', () => {
    expect(inicio.ubicacion.texto).toBe('Pueblo de Picoy, distrito de Santa Leonor, departamento de Lima')
    expect(inicio.ubicacion.texto).not.toMatch(/Huaral|Huaura/)
    expect(inicio.ubicacion.notas.join(' ')).toMatch(/Huaral/)
    expect(inicio.ubicacion.notas.join(' ')).toMatch(/Huaura/)
  })
  it('el tren de tratamiento tiene las 9 etapas en el orden de la memoria y sus unidades existen en la planta', () => {
    expect(inicio.tren.map((t) => t.nombre)).toEqual([
      'Cámara de rejas',
      'Desarenador',
      'Canal Parshall',
      'Tanque homogeneizador',
      'RAFA',
      'Filtro percolador',
      'Sedimentador secundario',
      'Desinfección',
      'Lecho de secado de lodos',
    ])
    const ids = planta.unidades.map((u) => u.id)
    for (const id of ['rejas', 'desarenador', 'parshall', 'homogeneizador', 'rafa', 'percolador', 'lechos-secado']) expect(ids).toContain(id)
  })
  it('el esquema rechaza caudales desordenados, población que baja y un valor sin fuente', () => {
    const a = structuredClone(inicio)
    a.caudales.qmin.valor = 99
    expect(esquemaInicio.safeParse(a).success).toBe(false)
    const b = structuredClone(inicio)
    b.poblacion.proyectada.valor = 100
    expect(esquemaInicio.safeParse(b).success).toBe(false)
    const c = structuredClone(inicio)
    c.caudales.qp.fuente = ''
    expect(esquemaInicio.safeParse(c).success).toBe(false)
  })
})

describe('vista de la pantalla de inicio', () => {
  const v = vistaInicio(inicio)
  it('da formato a los números: miles con espacio y decimales con punto', () => {
    expect(formatoNumero(5872)).toBe('5 872')
    expect(formatoNumero(6.536)).toBe('6.536')
    expect(formatoNumero(3011)).toBe('3 011')
  })
  it('muestra población, caudales y tren numerado desde los datos', () => {
    expect(v.poblacion.map((p) => p.valor)).toEqual(['5 872 hab.', '6 527 hab.'])
    expect(v.poblacion[1].etiqueta).toBe('proyectada al 2047')
    expect(v.caudales.map((c) => `${c.nombre} ${c.valor}`)).toEqual(['Qp 6.536 L/s', 'Qmd 8.496 L/s', 'Qmh 13.072 L/s', 'Qmin 3.268 L/s'])
    expect(v.tren[0]).toMatchObject({ numero: 1, nombre: 'Cámara de rejas', detalle: 'con bypass' })
    expect(v.tren[5].detalle).toBeNull()
    expect(v.titulo).toMatch(/Picoy/)
    expect(v.titulo).not.toMatch(/homogeneizador/i)
  })
})
