import { TEXTO_CALIDAD_AGUA as T } from '../nucleo/textos'
import { cargaKgDia } from '../nucleo/carga'
import { PARAMETROS, type EtapaCalidad, type Parametro } from '../estado/calidadAgua'
import type { CaudalNodo } from '../estado/lineaViva'

/** Concentración con pocas cifras: dos decimales por debajo de 10, uno hasta 1000; coliformes enteros, y en notación científica desde 10⁵. */
export function formatoConcentracion(v: number, p: Parametro): string {
  if (p === 'cf') {
    if (v < 1e5) return String(Math.round(v))
    const exp = Math.floor(Math.log10(v))
    return `${(v / 10 ** exp).toFixed(2)}×10${String(exp).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])}`
  }
  return v.toFixed(v < 10 ? 2 : 1)
}

export interface BarraCalidad {
  id: string
  nombre: string
  valor: number
  /** Largo de la barra (0 a 100): proporción del agua cruda (logarítmica en coliformes). */
  ancho: number
  /** Posición (0 a 100) de la marca del límite de descarga. */
  limiteAncho: number
  /** Fracción removida en esta etapa; null en el agua cruda y en la salida final. */
  remocion: number | null
  ejemplo: boolean
  cumple: boolean
  /** Texto del estado (con icono en la interfaz): nunca solo color. */
  estado: string
}

const escala = (v: number, referencia: number, p: Parametro): number => {
  if (p === 'cf') return v <= 1 ? 0 : Math.min(100, (Math.log10(v) / Math.log10(referencia)) * 100)
  return Math.min(100, (v / referencia) * 100)
}

/**
 * Las barras de un parámetro: agua cruda, cada etapa que remueve algo (las gemelas, como los dos sedimentadores, se juntan en una) y la salida final.
 * Cada barra es la concentración a la salida de la etapa; la marca es el límite de descarga.
 */
export function barrasParametro(etapas: EtapaCalidad[], p: Parametro, limite: number, nombres: { id: string; nombre: string }[]): BarraCalidad[] {
  if (etapas.length === 0) return []
  const cruda = etapas[0].entrada[p]
  const final = etapas[etapas.length - 1]
  const barra = (id: string, nombre: string, valor: number, remocion: number | null, ejemplo: boolean): BarraCalidad => {
    const cumple = valor <= limite
    return { id, nombre, valor, ancho: escala(valor, cruda, p), limiteAncho: escala(limite, cruda, p), remocion, ejemplo, cumple, estado: cumple ? T.cumple : T.noCumple }
  }
  const lista = [barra('cruda', T.aguaCruda, cruda, null, false)]
  let previa: EtapaCalidad | null = null
  for (const e of etapas.slice(0, -1)) {
    if (PARAMETROS.every((q) => e.remocion[q] === 0)) continue
    if (previa && JSON.stringify([previa.entrada, previa.remocion]) === JSON.stringify([e.entrada, e.remocion])) continue
    previa = e
    lista.push(barra(e.id, nombres.find((u) => u.id === e.id)?.nombre ?? e.id, e.salida[p], e.remocion[p], e.demo[p]))
  }
  lista.push(barra('final', T.salidaFinal, final.salida[p], null, false))
  return lista
}

export interface FilaBalance {
  id: string
  nombre: string
  caudalEntra: string
  caudalSale: string
  parametros: Record<Parametro, { entra: string; sale: string; remocion: string }>
  /** Carga de DBO que sale (kg/d) con el caudal en vivo. */
  cargaDboSale: string
}

/** La tabla de balance de masas: una fila por unidad con el caudal en vivo y la concentración de entrada y salida de cada parámetro. */
export function filasBalance(etapas: EtapaCalidad[], caudales: Record<string, CaudalNodo>, nombres: { id: string; nombre: string }[]): FilaBalance[] {
  return etapas.map((e) => {
    const q = caudales[e.id]
    return {
      id: e.id,
      nombre: nombres.find((u) => u.id === e.id)?.nombre ?? (e.id === 'salida' ? T.salidaFinal : e.id),
      caudalEntra: q ? q.entrada.toFixed(2) : T.sinDato,
      caudalSale: q ? q.salida.toFixed(2) : T.sinDato,
      parametros: Object.fromEntries(
        PARAMETROS.map((p) => [p, { entra: formatoConcentracion(e.entrada[p], p), sale: formatoConcentracion(e.salida[p], p), remocion: `${Math.round(e.remocion[p] * 100)} %` }]),
      ) as FilaBalance['parametros'],
      cargaDboSale: q ? cargaKgDia(e.salida.dbo, q.salida).toFixed(2) : T.sinDato,
    }
  })
}
