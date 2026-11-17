import calidadCruda from '../../datos/calidad.json'
import lodosCrudo from '../../datos/lodosBiogas.json'
import { useLodosBiogas } from '../estado/lodosBiogas'
import { esquemaCalidad } from './calidadEsquema'
import { produccionLodosBiogas } from './lodosBiogas'
import { esquemaLodosBiogas } from './lodosBiogasEsquema'

const datos = esquemaLodosBiogas.parse(lodosCrudo)
const dqoAfluente = esquemaCalidad.parse(calidadCruda).afluente.dqo.valor

/** Publica lo fijo de la línea de lodos y el biogás (porcentajes, lechos, biogás de diseño). Se llama una vez al arrancar. */
export function publicarDatosLodosBiogas(): void {
  useLodosBiogas.getState().publicarDatos({
    concentracionHumedo: datos.lodo.concentracionHumedo.valor,
    concentracionDeshidratado: datos.lodo.concentracionDeshidratado.valor,
    lechosAreaM2: datos.lechos.area.valor,
    lechosCicloDias: datos.lechos.ciclo.valor,
    biogasDisenoM3h: datos.referenciasHoja.biogas.valor,
    volumenEsEjemplo: datos.correccionVolumen.demo,
  })
}

/** Cantidades por día de biogás y lodo con el caudal (L/s) que llega al RAFA. */
export function publicarProduccion(caudalRafaLs: number): void {
  const p = produccionLodosBiogas(datos, dqoAfluente, caudalRafaLs)
  useLodosBiogas.getState().publicarProduccion({
    biogasM3dia: p.biogasM3dia,
    biogasM3h: p.biogasM3h,
    lodoKgDia: p.lodoKgDia,
    lodoHumedoM3dia: p.lodoHumedoM3dia,
    lodoDeshidratadoM3dia: p.lodoDeshidratadoM3dia,
  })
}
