import type { DatosSedimentador } from './esquema'
import { radioInterior } from './hidraulica'

/** Radios y alturas clave. Origen: centro del tanque; y = 0 en el fondo de la tolva. */
export interface DisposicionSedimentador {
  /** Radio interior del tanque, exterior del muro, interior y exterior del canal perimetral. */
  radio: number
  radioMuro: number
  radioCanalInterior: number
  radioCanalExterior: number
  /** y del tope de la tolva (= fondo del cilindro), de la superficie del agua, del borde del muro y del fondo del canal. */
  yTolva: number
  yAgua: number
  yTope: number
  yCanalFondo: number
}

export function disponer(d: DatosSedimentador): DisposicionSedimentador {
  const radio = radioInterior(d)
  const e = d.tanque.espesorMuro.valor
  const yTolva = d.tolva.altura.valor
  const yAgua = yTolva + d.tanque.alturaAgua.valor
  const yTope = yAgua + d.tanque.bordoLibre.valor
  return {
    radio,
    radioMuro: radio + e,
    radioCanalInterior: radio + e + d.canal.ancho.valor,
    radioCanalExterior: radio + e + d.canal.ancho.valor + e,
    yTolva,
    yAgua,
    yTope,
    yCanalFondo: yTope - d.canal.profundidad.valor,
  }
}
