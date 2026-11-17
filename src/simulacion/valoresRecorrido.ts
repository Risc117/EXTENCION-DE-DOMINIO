import calidadCruda from '../../datos/calidad.json'
import escala from '../../datos/escalaCaudal.json'
import lineaCruda from '../../datos/linea.json'
import lodosCrudo from '../../datos/lodosBiogas.json'
import { balanceCalidad } from './calidadAgua'
import { esquemaCalidad } from './calidadEsquema'
import { esquemaLinea } from './lineaEsquema'
import { produccionLodosBiogas } from './lodosBiogas'
import { esquemaLodosBiogas } from './lodosBiogasEsquema'

const PORCENTAJE = 100

/**
 * Valores que usan los textos de la demo de toda la planta ({qp}, {dboRafa}...): salen de los datos (caudales de diseño, cadena de calidad y
 * producción de lodo y biogás), los mismos que muestran los paneles. Se calculan al pedirlos, no al cargar el módulo.
 */
export function valoresPlanta(): Record<string, number> {
  const calidad = esquemaCalidad.parse(calidadCruda)
  const etapas = balanceCalidad(calidad, esquemaLinea.parse(lineaCruda).nodos)
  const etapa = (id: string) => etapas.find((e) => e.id === id)!
  const lodos = esquemaLodosBiogas.parse(lodosCrudo)
  const qp = escala.caudalPromedio.valor
  const produccion = produccionLodosBiogas(lodos, calidad.afluente.dqo.valor, qp)
  const entrada = etapas[0].entrada.dbo
  const final = etapas[etapas.length - 1].salida.dbo
  return {
    qp,
    qmh: escala.caudalMaximoHorario.valor,
    dboEntrada: entrada,
    dboRafa: etapa('rafa').salida.dbo,
    dboFinal: final,
    remocionRafa: etapa('rafa').remocion.dbo * PORCENTAJE,
    remocionTotal: (1 - final / entrada) * PORCENTAJE,
    biogas: produccion.biogasM3dia,
    lodoKgDia: produccion.lodoKgDia,
    lechosArea: lodos.lechos.area.valor,
  }
}
