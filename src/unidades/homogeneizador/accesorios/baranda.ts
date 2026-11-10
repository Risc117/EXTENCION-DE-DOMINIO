import type { DatosHomogeneizador } from '../esquema'
import { FRACCION_RIEL_MEDIO } from '../../../nucleo/constantes'
import { cilindroVertical, cotaTecho, SIN_GIRO } from './cotas'
import type { PiezaAccesorio } from './tipos'

/**
 * Baranda sobre el borde de la losa de techo, con un hueco para el portillo del lado de la salida (+x).
 * Los postes van parejos de un borde del hueco al otro y los pasamanos unen un poste con el siguiente.
 */
export function construirBaranda(d: DatosHomogeneizador): PiezaAccesorio[] {
  const b = d.accesorios.baranda
  const techo = cotaTecho(d)
  const altura = b.altura.valor
  const radioTubo = b.diametroTubo.valor / 2
  const radioAro = d.tanque.diametroExterior.valor / 2 - b.retranqueBorde.valor
  const medioHueco = Math.asin(d.accesorios.portillo.ancho.valor / 2 / radioAro)
  const n = b.numeroPostes.valor
  const paso = (2 * Math.PI - 2 * medioHueco) / (n - 1)
  const punto = (i: number): [number, number] => {
    const fi = medioHueco + i * paso
    return [radioAro * Math.cos(fi), radioAro * Math.sin(fi)]
  }

  const piezas: PiezaAccesorio[] = []
  for (let i = 0; i < n; i++) {
    const [x, z] = punto(i)
    piezas.push(cilindroVertical(`poste-${i}`, 'baranda', x, z, techo, techo + altura, radioTubo))
  }
  for (let i = 0; i < n - 1; i++) {
    const [xa, za] = punto(i)
    const [xb, zb] = punto(i + 1)
    const direccion = Math.atan2(zb - za, xb - xa)
    for (const [nombre, fraccion] of [['alto', 1], ['medio', FRACCION_RIEL_MEDIO]] as const) {
      piezas.push({
        id: `pasamanos-${nombre}-${i}`, tipo: 'riel-baranda', forma: 'cilindro', radio: radioTubo,
        largo: Math.hypot(xb - xa, zb - za),
        posicion: [(xa + xb) / 2, techo + altura * fraccion, (za + zb) / 2],
        rotacion: [0, -direccion, Math.PI / 2],
      })
    }
  }
  const p = d.accesorios.portillo
  piezas.push({
    id: 'portillo', tipo: 'portillo', forma: 'caja', rotacion: SIN_GIRO,
    tamano: [p.espesor.valor, altura, p.ancho.valor],
    posicion: [radioAro, techo + altura / 2, 0],
  })
  return piezas
}
