import { PARAMETROS, type Concentracion, type Parametro } from '../estado/calidadAgua'
import type { DatosCalidad } from './calidadEsquema'

export { cargaKgDia } from '../nucleo/carga'
export { PARAMETROS }

export interface EtapaBalance {
  id: string
  entrada: Concentracion
  salida: Concentracion
  /** Fracción removida (0 a 1) en la unidad. */
  remocion: Concentracion
}

const cero = (): Concentracion => ({ dbo: 0, dqo: 0, sst: 0, cf: 0 })

/**
 * Concentración de entrada y de salida de cada unidad. La entrada de la primera unidad es el afluente; la de las demás es el promedio de las
 * salidas que le llegan, ponderado por el caudal de cada una (la fracción de caudal que cada unidad manda a sus destinos). `nodos` va en el orden de la línea.
 */
export function balanceCalidad(d: DatosCalidad, nodos: { id: string; destinos: { id: string; fraccion: number }[] }[]): EtapaBalance[] {
  const caudal = new Map<string, number>([[nodos[0].id, 1]])
  const masa = new Map<string, Concentracion>([[nodos[0].id, { dbo: d.afluente.dbo.valor, dqo: d.afluente.dqo.valor, sst: d.afluente.sst.valor, cf: d.afluente.cf.valor }]])
  const resultado: EtapaBalance[] = []
  for (const n of nodos) {
    const q = caudal.get(n.id) ?? 0
    const acumulado = masa.get(n.id) ?? cero()
    // Si es la primera unidad, `masa` ya trae la concentración; si no, trae la suma de caudal × concentración de lo que llega.
    const entrada: Concentracion = n.id === nodos[0].id ? acumulado : (Object.fromEntries(PARAMETROS.map((p) => [p, q === 0 ? 0 : acumulado[p] / q])) as Concentracion)
    const remocion = d.etapas.find((e) => e.id === n.id)?.remocion
    const quitado = (p: Parametro) => remocion?.[p].valor ?? 0
    const salida = Object.fromEntries(PARAMETROS.map((p) => [p, entrada[p] * (1 - quitado(p))])) as Concentracion
    resultado.push({ id: n.id, entrada, salida, remocion: Object.fromEntries(PARAMETROS.map((p) => [p, quitado(p)])) as Concentracion })
    for (const dest of n.destinos) {
      const aporte = q * dest.fraccion
      caudal.set(dest.id, (caudal.get(dest.id) ?? 0) + aporte)
      const previo = masa.get(dest.id) ?? cero()
      masa.set(dest.id, Object.fromEntries(PARAMETROS.map((p) => [p, previo[p] + aporte * salida[p]])) as Concentracion)
    }
  }
  return resultado
}

/** true si el valor no supera el límite máximo. */
export const cumpleLimite = (valor: number, limite: number): boolean => valor <= limite

