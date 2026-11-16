import type { DatosPercolador } from './esquema'
import { radioInterior } from './hidraulica'

/** Alturas y radios clave del filtro. Origen: centro de la columna; y = 0 en el fondo de la losa; el canal central va a lo largo de x. */
export interface DisposicionPercolador {
  radio: number
  radioExterior: number
  radioColumna: number
  /** y de la cara superior de la losa, de la cara inferior del lecho y del tope del lecho (= tope del muro). */
  yLosa: number
  yCamara: number
  yLecho: number
  /** y de la punta de la columna y del eje de los brazos. */
  yColumna: number
  yBrazo: number
  /** Ancho de la cámara de salida y x de su cara oeste (en el muro). */
  xSalida: number
}

export function disponer(d: DatosPercolador): DisposicionPercolador {
  const radio = radioInterior(d)
  const radioExterior = radio + d.cuerpo.espesorMuro.valor
  const yLosa = d.cuerpo.espesorLosa.valor
  const yCamara = yLosa + d.camaraInferior.altura.valor
  const yLecho = yCamara + d.lecho.altura.valor
  return {
    radio,
    radioExterior,
    radioColumna: d.distribuidor.diametroColumna.valor / 2,
    yLosa,
    yCamara,
    yLecho,
    yColumna: yLecho + d.distribuidor.alturaColumnaSobreLecho.valor,
    yBrazo: yLecho + d.distribuidor.alturaBrazoSobreLecho.valor,
    xSalida: radioExterior,
  }
}
