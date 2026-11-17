import { TEXTO_MEZCLA as T } from '../nucleo/textosMezcla'
import type { DiferenciaDescarga, EscenarioMezcla, LimiteMezcla, ParametroMezcla } from '../estado/mezclaRio'
import { formatoConcentracion } from './vistaCalidad'

const ESPACIO_FINO = ' '
const DECIMALES = 2

/** Número con dos decimales y miles separados por un espacio (1698.8 → "1 698.80"). */
export function formatoDosDecimales(n: number): string {
  const [entero, decimales] = n.toFixed(DECIMALES).split('.')
  return `${entero.replace(/\B(?=(\d{3})+(?!\d))/g, ESPACIO_FINO)}.${decimales}`
}

/** Valor de un parámetro: los coliformes como en el panel de calidad; lo demás con dos decimales. */
export const formatoParametro = (v: number, p: ParametroMezcla): string => (p === 'cf' ? formatoConcentracion(v, 'cf') : formatoDosDecimales(v))

export interface CeldaLimite {
  /** "< 15" o "≥ 5". */
  limite: string
  cumple: boolean
  /** "✓ Cumple" o "✕ No cumple": nunca solo color. */
  estado: string
}

export interface FilaVista {
  parametro: string
  descarga: string
  mezcla: string
  eca: CeldaLimite | null
  lmp: CeldaLimite | null
}

export interface EscenarioVista {
  id: string
  titulo: string
  filas: FilaVista[]
  resumen: string
  cumpleTodo: boolean
}

/** "< 15" o "≥ 5": el límite con su sentido. */
const textoLimite = (l: LimiteMezcla, p: ParametroMezcla): string => `${l.tipo === 'maximo' ? T.maximo : T.minimo} ${formatoParametro(l.valor, p)}`

const celda = (l: LimiteMezcla | null, p: ParametroMezcla): CeldaLimite | null => (l ? { limite: textoLimite(l, p), cumple: l.cumple, estado: l.cumple ? `✓ ${T.cumple}` : `✕ ${T.noCumple}` } : null)

/** Los límites que no se cumplen en un escenario, dichos con su sigla ("DBO₅ (ECA < 15)"). */
function incumplimientos(e: EscenarioMezcla): string[] {
  const lista: string[] = []
  for (const f of e.filas) {
    if (f.eca && !f.eca.cumple) lista.push(T.de(T.parametros[f.parametro], `ECA ${textoLimite(f.eca, f.parametro)}`))
    if (f.lmp && !f.lmp.cumple) lista.push(T.de(T.parametros[f.parametro], `LMP ${textoLimite(f.lmp, f.parametro)}`))
  }
  return lista
}

/** Cada escenario (estiaje, lluvia) con sus filas y un resumen de lo que no cumple y contra qué límite. */
export function vistaEscenarios(escenarios: EscenarioMezcla[]): EscenarioVista[] {
  return escenarios.map((e) => {
    const falla = incumplimientos(e)
    return {
      id: e.id,
      titulo: T.escenario(e.nombre, `${formatoDosDecimales(e.caudalRio)} ${T.unidadCaudal}`),
      filas: e.filas.map((f) => ({ parametro: T.parametros[f.parametro], descarga: formatoParametro(f.descarga, f.parametro), mezcla: formatoParametro(f.mezcla, f.parametro), eca: celda(f.eca, f.parametro), lmp: celda(f.lmp, f.parametro) })),
      resumen: falla.length === 0 ? T.resumenCumple : `${T.resumenNoCumple} ${falla.join(T.separadorLista)}.`,
      cumpleTodo: falla.length === 0,
    }
  })
}

export interface FilaDiferencia {
  parametro: string
  memoria: string
  visor: string
  /** "+9.22" o "coinciden". */
  diferencia: string
  veces: string | null
  coincide: boolean
}

const signo = (n: number): string => (n > 0 ? '+' : '')

/** La descarga de la memoria y la del visor, lado a lado, con su diferencia. */
export function vistaDiferencias(d: DiferenciaDescarga[]): FilaDiferencia[] {
  return d.map((x) => ({
    parametro: T.parametros[x.parametro],
    memoria: formatoParametro(x.memoria, x.parametro),
    visor: formatoParametro(x.visor, x.parametro),
    diferencia: x.coincide ? T.coincide : `${signo(x.diferencia)}${formatoParametro(x.diferencia, x.parametro)}`,
    veces: x.coincide ? null : T.veces(x.veces.toFixed(1)),
    coincide: x.coincide,
  }))
}
