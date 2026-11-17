import { FACTOR_CUERPO_VALVULA, FRACCION_VALVULA_INGRESO } from '../../../nucleo/constantes'
import type { DatosHomogeneizador } from '../esquema'
import { direccionPuerto } from '../puertos'
import { cilindroVertical, cotaTecho, SIN_GIRO } from './cotas'
import type { PiezaAccesorio } from './tipos'

/**
 * Caja de válvula sobre el terreno, encima del tubo, con su varilla de maniobra hasta la válvula.
 * Una en la dirección del tubo de ingreso y otra en la del tubo de salida (`angulo` de datos/homogeneizador.json).
 */
export function construirCajasValvula(d: DatosHomogeneizador): PiezaAccesorio[] {
  const c = d.accesorios.cajaValvula
  const terreno = cotaTecho(d)
  const radioExt = d.tanque.diametroExterior.valor / 2
  /** La entrada sale del muro solo hasta su tubo vertical: su válvula va sobre ese tramo. La salida usa la distancia del JSON. */
  const distancia = { ingreso: Math.min(c.distanciaAlMuro.valor, d.ingreso.distanciaRiser.valor * FRACCION_VALVULA_INGRESO), salida: c.distanciaAlMuro.valor }
  const piezas: PiezaAccesorio[] = []
  for (const [nombre, angulo, altura] of [['ingreso', d.ingreso.angulo.valor, d.ingreso.altura.valor], ['salida', d.salida.angulo.valor, d.salida.altura.valor]] as const) {
    const fi = direccionPuerto(angulo)
    const x0 = radioExt + distancia[nombre]
    const [x, z] = [x0 * Math.cos(fi), x0 * Math.sin(fi)]
    piezas.push({
      id: `caja-valvula-${nombre}`, tipo: 'caja-valvula', forma: 'caja', rotacion: SIN_GIRO,
      tamano: [c.lado.valor, c.alto.valor, c.lado.valor], posicion: [x, terreno + c.alto.valor / 2, z],
    })
    piezas.push(cilindroVertical(`varilla-${nombre}`, 'varilla', x, z, altura, terreno + c.alto.valor, c.diametroVarilla.valor / 2))
    // Cuerpo de la válvula: un cilindro corto que abraza el tubo.
    piezas.push({
      id: `valvula-${nombre}`, tipo: 'valvula', forma: 'cilindro', radio: (c.diametroValvula.valor * FACTOR_CUERPO_VALVULA) / 2,
      largo: c.diametroValvula.valor, posicion: [x, altura, z], rotacion: [0, -fi, Math.PI / 2],
    })
  }
  return piezas
}
