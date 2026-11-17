import { cargaKgDia } from '../nucleo/carga'
import { HORAS_POR_DIA } from '../nucleo/constantes'
import type { DatosLodosBiogas } from './lodosBiogasEsquema'

const PORCENTAJE = 100

export interface ProduccionLodosBiogas {
  /** Carga de DQO aplicada al RAFA (kg/d). */
  dqoAplicada: number
  biogasM3dia: number
  biogasM3h: number
  /** Sólidos del lodo (kg SST/d). */
  lodoKgDia: number
  /** Volumen del lodo húmedo y del deshidratado (m3/d): cálculo corregido del Excel, Dato de ejemplo. */
  lodoHumedoM3dia: number
  lodoDeshidratadoM3dia: number
}

/**
 * Cantidades por día de biogás y lodo del RAFA con el caudal que le llega (L/s) y la DQO del afluente (mg/L), con las fórmulas de la hoja RAFA:
 * W = DQO × Q (carga aplicada), gas = 0.34 × W, lodo = Y × W; el volumen del lodo = sólidos / (densidad × concentración).
 */
export function produccionLodosBiogas(d: DatosLodosBiogas, dqoMgL: number, caudalLs: number): ProduccionLodosBiogas {
  const dqoAplicada = cargaKgDia(dqoMgL, caudalLs)
  const biogasM3dia = d.biogas.produccionEspecifica.valor * dqoAplicada
  const lodoKgDia = d.lodo.rendimiento.valor * dqoAplicada
  const volumen = (densidad: number, porcentaje: number) => lodoKgDia / (densidad * (porcentaje / PORCENTAJE))
  return {
    dqoAplicada,
    biogasM3dia,
    biogasM3h: biogasM3dia / HORAS_POR_DIA,
    lodoKgDia,
    lodoHumedoM3dia: volumen(d.lodo.densidadHumedo.valor, d.lodo.concentracionHumedo.valor),
    lodoDeshidratadoM3dia: volumen(d.lodo.densidadDeshidratado.valor, d.lodo.concentracionDeshidratado.valor),
  }
}
