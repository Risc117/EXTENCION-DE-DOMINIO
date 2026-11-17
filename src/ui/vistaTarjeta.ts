import { TEXTO_DATO_EJEMPLO } from '../nucleo/constantes'
import { TEXTO_TARJETA as T } from '../nucleo/textos'
import type { CaudalNodo, NodoLineaViva } from '../estado/lineaViva'

const caudal = (v: number | undefined): string => (v === undefined ? T.sinDato : `${v.toFixed(2)} L/s`)

/** Tiempo de retención con una cifra decimal; "Dato de ejemplo" si el valor no sale de la hoja de cálculo. */
export function textoRetencion(r: NodoLineaViva['retencion']): string {
  if (!r) return T.sinRetencion
  return `${r.valor.toFixed(1)} ${r.unidad}${r.demo ? ` · ${TEXTO_DATO_EJEMPLO}` : ''}`
}

export interface DatosTarjeta {
  id: string
  nombres: { id: string; nombre: string }[]
  nodos: NodoLineaViva[]
  caudales: Record<string, CaudalNodo>
  /** Nivel de agua (m) si la simulación lo calcula para esa estructura; null si no. */
  nivel: number | null
}

export interface VistaTarjeta {
  nombre: string
  /** Filas "etiqueta: valor"; vacía si la estructura no está en el recorrido del agua. */
  filas: { etiqueta: string; valor: string }[]
  sinCaudal: boolean
}

/** Lo que dice la tarjeta de una estructura. */
export function vistaTarjeta(d: DatosTarjeta): VistaTarjeta {
  const nombre = d.nombres.find((u) => u.id === d.id)?.nombre ?? d.id
  const nodo = d.nodos.find((n) => n.id === d.id)
  if (!nodo) return { nombre, filas: [], sinCaudal: true }
  const q = d.caudales[d.id]
  return {
    nombre,
    sinCaudal: false,
    filas: [
      { etiqueta: T.entra, valor: caudal(q?.entrada) },
      { etiqueta: T.sale, valor: caudal(q?.salida) },
      { etiqueta: T.retencion, valor: textoRetencion(nodo.retencion) },
      { etiqueta: T.nivel, valor: d.nivel === null ? T.nivelNoSimula : `${d.nivel.toFixed(2)} m` },
    ],
  }
}

export interface CajaDiagrama {
  id: string
  nombre: string
  caudal: string
  columna: number
  fila: number
  elegida: boolean
}

/** Las cajas del diagrama de bloques: una por unidad, con su lugar y su caudal de salida en vivo. */
export function cajasDiagrama(nodos: NodoLineaViva[], caudales: Record<string, CaudalNodo>, nombres: { id: string; nombre: string }[], elegida: string | null): CajaDiagrama[] {
  return nodos.map((n) => ({
    id: n.id,
    nombre: nombres.find((u) => u.id === n.id)?.nombre ?? (n.id === 'salida' ? T.salida : n.id),
    caudal: caudales[n.id] === undefined ? T.sinDato : caudal(caudales[n.id].salida),
    columna: n.columna,
    fila: n.fila,
    elegida: elegida === n.id,
  }))
}
