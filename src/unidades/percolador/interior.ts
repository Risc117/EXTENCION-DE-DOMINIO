import { ESPESOR_VENTANA_PERCOLADOR } from '../../nucleo/constantesPercolador'
import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import { cajaEntre as caja } from '../comun/cajas'
import type { Pieza } from '../comun/tipos'
import { disponer } from './disposicion'
import type { DatosPercolador } from './esquema'

/** Lo de adentro: vigas de soporte, ventanas de ventilación, lecho de roca, columna central, tubería de entrada y canal central. */
export function construirInterior(d: DatosPercolador): Pieza[] {
  const s = disponer(d)
  const c = d.camaraInferior
  const piezas: Pieza[] = []
  const nVigas = c.cantidadVigas.valor
  for (let i = 0; i < nVigas; i++) {
    const z = ((i + 1) / (nVigas + 1)) * 2 * s.radio - s.radio
    const semiLargo = Math.sqrt(s.radio ** 2 - z ** 2)
    piezas.push(caja(`viga-${i + 1}`, '--color-losa', [-semiLargo, semiLargo], [s.yCamara - c.alturaViga.valor, s.yCamara], [z - c.anchoViga.valor / 2, z + c.anchoViga.valor / 2]))
  }
  const nVentanas = c.cantidadVentanas.valor
  for (let i = 0; i < nVentanas; i++) {
    const a = (2 * Math.PI * i) / nVentanas
    const r = s.radioExterior + ESPESOR_VENTANA_PERCOLADOR / 2
    const lado = c.ladoVentana.valor
    piezas.push({
      id: `ventana-${i + 1}`,
      forma: 'caja',
      color: '--color-ventilacion',
      pos: [r * Math.cos(a), s.yLosa + c.alturaVentanaSobreLosa.valor + lado / 2, r * Math.sin(a)],
      tam: [ESPESOR_VENTANA_PERCOLADOR, lado, lado],
      giroY: -a,
      accesorio: true,
    })
  }
  const lecho = d.lecho.altura.valor
  const entrada = d.entrada.diametro.valor
  const yEntrada = d.entrada.altura.valor
  const largoEntrada = s.radioExterior + PROLONGACION_TUBO
  piezas.push(
    { id: 'lecho', forma: 'cilindro', color: '--color-relleno', pos: [0, s.yCamara + lecho / 2, 0], radio: s.radio, alto: lecho },
    { id: 'columna', forma: 'cilindro', color: '--color-muro', pos: [0, (s.yLosa + s.yColumna) / 2, 0], radio: s.radioColumna, alto: s.yColumna - s.yLosa },
    // La entrada cruza el muro por el oeste a la altura del perfil, dentro de la cámara inferior, y sube por la columna central.
    { id: 'tubo-entrada', forma: 'cilindro', color: '--color-ingreso', pos: [-largoEntrada / 2, yEntrada, 0], radio: entrada / 2, alto: largoEntrada, eje: 'x' },
    { id: 'tubo-subida', forma: 'cilindro', color: '--color-ingreso', pos: [0, (s.yColumna + yEntrada - entrada / 2) / 2, 0], radio: entrada / 2, alto: s.yColumna - yEntrada + entrada / 2 },
    caja('canal-central', '--color-solado', [-s.radio, s.radio], [s.yLosa, s.yLosa + d.canal.alto.valor], [-d.canal.ancho.valor / 2, d.canal.ancho.valor / 2]),
  )
  return piezas
}
