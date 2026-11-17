import { describe, expect, it } from 'vitest'
import { AJUSTE_GESTOS_DEFECTO } from '../../nucleo/constantes'
import { CUADROS_POSTURA } from '../../nucleo/constantesGestos'
import { manoAbierta, manoConDedos, manoPuno } from './ejemplos'
import { interpretar, type Memoria, type Resultado } from './interpretar'
import type { Punto } from './puntos'
import { posturaDedos } from './reconocer'

describe('postura de los dedos', () => {
  it('un dedo (solo el índice) = uno; índice y medio = dos; índice, medio y anular = tres', () => {
    expect(posturaDedos(manoConDedos([true, false, false, false]))).toBe('uno')
    expect(posturaDedos(manoConDedos([true, true, false, false]))).toBe('dos')
    expect(posturaDedos(manoConDedos([true, true, true, false]))).toBe('tres')
  })
  it('la mano abierta y el puño no son una postura de estructura (son girar y pausar)', () => {
    expect(posturaDedos(manoAbierta())).toBeNull()
    expect(posturaDedos(manoPuno())).toBeNull()
  })
  it('otras combinaciones de dedos tampoco (por ejemplo solo el meñique o el índice con el anular)', () => {
    expect(posturaDedos(manoConDedos([false, false, false, true]))).toBeNull()
    expect(posturaDedos(manoConDedos([true, false, true, false]))).toBeNull()
  })
})

function correr(cuadros: (Punto[] | null)[], ajuste = AJUSTE_GESTOS_DEFECTO): Resultado[] {
  let memoria: Memoria | null = null
  return cuadros.map((c) => {
    const r = interpretar(memoria, c, ajuste)
    memoria = r.memoria
    return r
  })
}
const repetir = (mano: Punto[], n: number) => Array.from({ length: n }, () => mano)
const ordenes = (r: Resultado[]) => r.map((x) => x.orden)

describe('órdenes con los dedos: estructura siguiente, anterior y vista general', () => {
  it('mantener un dedo el tiempo pedido da "siguiente", una sola vez', () => {
    const r = correr(repetir(manoConDedos([true, false, false, false]), CUADROS_POSTURA + 10))
    expect(ordenes(r).filter((o) => o !== null)).toEqual(['siguiente'])
    expect(r[CUADROS_POSTURA - 1].orden).toBe('siguiente')
    expect(r[CUADROS_POSTURA - 2].orden).toBeNull()
  })
  it('dos dedos dan "anterior" y tres dedos dan "general"', () => {
    expect(ordenes(correr(repetir(manoConDedos([true, true, false, false]), CUADROS_POSTURA))).pop()).toBe('anterior')
    expect(ordenes(correr(repetir(manoConDedos([true, true, true, false]), CUADROS_POSTURA))).pop()).toBe('general')
  })
  it('un gesto que dura menos de lo pedido no da orden', () => {
    const r = correr([...repetir(manoAbierta(), 3), ...repetir(manoConDedos([true, false, false, false]), CUADROS_POSTURA - 1), ...repetir(manoAbierta(), 3)])
    expect(ordenes(r).every((o) => o === null)).toBe(true)
  })
  it('cambiar de postura reinicia la cuenta; para repetir la orden hay que soltar y volver a hacerla', () => {
    const uno = manoConDedos([true, false, false, false])
    const r = correr([...repetir(uno, CUADROS_POSTURA), ...repetir(manoAbierta(), 2), ...repetir(uno, CUADROS_POSTURA)])
    expect(ordenes(r).filter((o) => o !== null)).toEqual(['siguiente', 'siguiente'])
  })
  it('mientras se hace la postura no gira ni hace zoom, y al soltarla no hay saltos', () => {
    const r = correr([manoAbierta(), ...repetir(manoConDedos([true, false, false, false]), 5), manoAbierta(0.2, 0)])
    for (const x of r.slice(1, 7)) {
      expect(x.giro).toEqual({ acimut: 0, elevacion: 0 })
      expect(x.zoom).toBe(1)
    }
  })
  it('sin mano o con la mano abierta y quieta nunca hay orden', () => {
    expect(ordenes(correr([null, null, ...repetir(manoAbierta(), 20)])).every((o) => o === null)).toBe(true)
  })
})
