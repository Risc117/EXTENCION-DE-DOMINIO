import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TEXTO_DATO_EJEMPLO } from '../nucleo/constantes'
import type { NodoLineaViva } from '../estado/lineaViva'
import { DiagramaLinea } from './DiagramaLinea'
import { TarjetaUnidad } from './TarjetaUnidad'
import { cajasDiagrama, textoRetencion, vistaTarjeta } from './vistaTarjeta'

const nodos: NodoLineaViva[] = [
  { id: 'rafa', retencion: { valor: 11.02, unidad: 'h', demo: false }, destinos: [{ id: 'percolador', fraccion: 1 }], columna: 0, fila: 0 },
  { id: 'percolador', retencion: { valor: 30, unidad: 'min', demo: true }, destinos: [], columna: 1, fila: 0 },
  { id: 'homogeneizador', retencion: null, destinos: [], columna: 2, fila: 0 },
]
const nombres = [
  { id: 'rafa', nombre: 'RAFA' },
  { id: 'percolador', nombre: 'Filtro percolador' },
  { id: 'lechos-secado', nombre: 'Lechos de secado' },
  { id: 'homogeneizador', nombre: 'Homogeneizador' },
]
const caudales = { rafa: { entrada: 6.25, salida: 6.5 }, percolador: { entrada: 6.5, salida: 6.5 }, homogeneizador: { entrada: 5, salida: 4 } }
const datos = (id: string, nivel: number | null = null) => ({ id, nombres, nodos, caudales, nivel })

describe('tarjeta de una estructura', () => {
  it('muestra el nombre, los caudales y la retención sin "Dato de ejemplo" si viene de la hoja', () => {
    const v = vistaTarjeta(datos('rafa'))
    const texto = v.filas.map((f) => `${f.etiqueta}: ${f.valor}`).join(' | ')
    expect(v.nombre).toBe('RAFA')
    expect(texto).toContain('6.25 L/s')
    expect(texto).toContain('6.50 L/s')
    expect(texto).toContain('11.0 h')
    expect(texto).not.toContain(TEXTO_DATO_EJEMPLO)
    expect(texto).toContain('no se simula')
  })
  it('marca "Dato de ejemplo" cuando la retención lo es', () => {
    expect(textoRetencion(nodos[1].retencion)).toContain(TEXTO_DATO_EJEMPLO)
    expect(textoRetencion(nodos[0].retencion)).not.toContain(TEXTO_DATO_EJEMPLO)
  })
  it('una unidad sin caudal de agua en la línea lo dice', () => {
    const v = vistaTarjeta(datos('lechos-secado'))
    expect(v.sinCaudal).toBe(true)
    expect(v.filas).toHaveLength(0)
  })
  it('muestra el nivel donde la simulación lo calcula', () => {
    const v = vistaTarjeta(datos('homogeneizador', 2.5))
    expect(v.filas.find((f) => f.etiqueta === 'Nivel de agua')?.valor).toBe('2.50 m')
  })
  it('sin caudales todavía muestra una raya en vez de números', () => {
    const v = vistaTarjeta({ ...datos('rafa'), caudales: {} })
    expect(v.filas[0].valor).toBe('—')
  })
  it('no se ve si no hay nada seleccionado', () => {
    expect(renderToString(createElement(TarjetaUnidad))).toBe('')
    expect(renderToString(createElement(DiagramaLinea))).toBe('')
  })
})

describe('diagrama de bloques de la línea', () => {
  it('trae una caja por unidad con su caudal de salida, su lugar y marca solo la elegida', () => {
    const cajas = cajasDiagrama(nodos, caudales, nombres, 'rafa')
    expect(cajas.map((c) => c.nombre)).toEqual(['RAFA', 'Filtro percolador', 'Homogeneizador'])
    expect(cajas[0].caudal).toBe('6.50 L/s')
    expect(cajas.filter((c) => c.elegida).map((c) => c.id)).toEqual(['rafa'])
    expect(cajas[1].columna).toBe(1)
  })
  it('la salida de la planta lleva su nombre aunque no sea una unidad enfocable', () => {
    const c = cajasDiagrama([{ id: 'salida', retencion: null, destinos: [], columna: 3, fila: 0 }], {}, nombres, null)
    expect(c[0].nombre).toBe('Salida de agua tratada')
  })
})
