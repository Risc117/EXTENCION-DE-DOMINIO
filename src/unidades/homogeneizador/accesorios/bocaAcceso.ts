import type { DatosHomogeneizador } from '../esquema'
import { cotaTecho, SIN_GIRO } from './cotas'
import type { PiezaAccesorio } from './tipos'

/** Boca de acceso cuadrada: brocal sobre la losa y tapa encima, del lado de la salida (+x). */
export function construirBocaAcceso(d: DatosHomogeneizador): PiezaAccesorio[] {
  const b = d.accesorios.bocaAcceso
  const techo = cotaTecho(d)
  const lado = b.lado.valor
  const x = b.distanciaAlCentro.valor
  const alto = b.alturaBrocal.valor
  const tapa = b.espesorTapa.valor
  return [
    { id: 'brocal', tipo: 'brocal', forma: 'caja', tamano: [lado, alto, lado], posicion: [x, techo + alto / 2, 0], rotacion: SIN_GIRO },
    { id: 'tapa', tipo: 'tapa', forma: 'caja', tamano: [lado, tapa, lado], posicion: [x, techo + alto + tapa / 2, 0], rotacion: SIN_GIRO },
  ]
}
