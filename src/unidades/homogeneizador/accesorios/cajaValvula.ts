import { FACTOR_CUERPO_VALVULA } from '../../../nucleo/constantes'
import type { DatosHomogeneizador } from '../esquema'
import { cilindroVertical, cotaTecho, SIN_GIRO } from './cotas'
import type { PiezaAccesorio } from './tipos'

/**
 * Caja de válvula sobre el terreno, encima del tubo, con su varilla de maniobra hasta la válvula.
 * Una del lado del ingreso (-x) y otra del lado de la salida (+x).
 */
export function construirCajasValvula(d: DatosHomogeneizador): PiezaAccesorio[] {
  const c = d.accesorios.cajaValvula
  const terreno = cotaTecho(d)
  const x0 = d.tanque.diametroExterior.valor / 2 + c.distanciaAlMuro.valor
  const piezas: PiezaAccesorio[] = []
  for (const [nombre, signo, altura] of [['ingreso', -1, d.ingreso.altura.valor], ['salida', 1, d.salida.altura.valor]] as const) {
    const x = signo * x0
    piezas.push({
      id: `caja-valvula-${nombre}`, tipo: 'caja-valvula', forma: 'caja', rotacion: SIN_GIRO,
      tamano: [c.lado.valor, c.alto.valor, c.lado.valor], posicion: [x, terreno + c.alto.valor / 2, 0],
    })
    piezas.push(cilindroVertical(`varilla-${nombre}`, 'varilla', x, 0, altura, terreno + c.alto.valor, c.diametroVarilla.valor / 2))
    // Cuerpo de la válvula: un cilindro corto que abraza el tubo.
    piezas.push({
      id: `valvula-${nombre}`, tipo: 'valvula', forma: 'cilindro', radio: (c.diametroValvula.valor * FACTOR_CUERPO_VALVULA) / 2,
      largo: c.diametroValvula.valor, posicion: [x, altura, 0], rotacion: [0, 0, Math.PI / 2],
    })
  }
  return piezas
}
