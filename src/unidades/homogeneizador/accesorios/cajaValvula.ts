import { FACTOR_CUERPO_VALVULA, FRACCION_VALVULA_INGRESO, PROLONGACION_TUBO } from '../../../nucleo/constantes'
import type { DatosHomogeneizador } from '../esquema'
import { direccionPuerto } from '../puertos'
import { cilindroVertical, SIN_GIRO } from './cotas'
import type { PiezaAccesorio } from './tipos'

/**
 * Caja de válvula sobre el terreno, encima del tubo, con su varilla de maniobra hasta la válvula.
 * Una en la dirección del tubo de ingreso y otra en la del tubo de salida (`angulo` de datos/homogeneizador.json).
 */
export function construirCajasValvula(d: DatosHomogeneizador): PiezaAccesorio[] {
  const c = d.accesorios.cajaValvula
  // El suelo real (el del terreno levantado): no la losa de techo, el tanque sale del suelo.
  const terreno = d.accesorios.terreno.nivelSuelo.valor
  const radioExt = d.tanque.diametroExterior.valor / 2
  /** La válvula de la entrada va a la mitad del tubo que sale del muro. La salida usa la distancia del JSON. */
  const distancia = { ingreso: Math.min(c.distanciaAlMuro.valor, PROLONGACION_TUBO * FRACCION_VALVULA_INGRESO), salida: c.distanciaAlMuro.valor }
  const piezas: PiezaAccesorio[] = []
  for (const [nombre, angulo, altura] of [['ingreso', d.ingreso.angulo.valor, d.ingreso.altura.valor], ['salida', d.salida.angulo.valor, d.salida.altura.valor]] as const) {
    const fi = direccionPuerto(angulo)
    const x0 = radioExt + distancia[nombre]
    const [x, z] = [x0 * Math.cos(fi), x0 * Math.sin(fi)]
    // Un tubo por el aire (la entrada llega más arriba del suelo) no lleva caja ni varilla: solo su válvula.
    if (altura < terreno) {
      piezas.push({
        id: `caja-valvula-${nombre}`, tipo: 'caja-valvula', forma: 'caja', rotacion: SIN_GIRO,
        tamano: [c.lado.valor, c.alto.valor, c.lado.valor], posicion: [x, terreno + c.alto.valor / 2, z],
      })
      piezas.push(cilindroVertical(`varilla-${nombre}`, 'varilla', x, z, altura, terreno + c.alto.valor, c.diametroVarilla.valor / 2))
    }
    // Cuerpo de la válvula: un cilindro corto que abraza el tubo.
    piezas.push({
      id: `valvula-${nombre}`, tipo: 'valvula', forma: 'cilindro', radio: (c.diametroValvula.valor * FACTOR_CUERPO_VALVULA) / 2,
      largo: c.diametroValvula.valor, posicion: [x, altura, z], rotacion: [0, -fi, Math.PI / 2],
    })
  }
  return piezas
}
