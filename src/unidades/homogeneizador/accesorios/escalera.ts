import { GROSOR_ARO_JAULA, HOLGURA_JAULA_MURO, RADIO_BARRA_JAULA, RADIO_PELDANO, RADIO_RIEL_ESCALERA } from '../../../nucleo/constantes'
import type { DatosHomogeneizador } from '../esquema'
import { ACOSTADO_EN_Z, cilindroVertical, cotaTecho, xEscalera } from './cotas'
import type { PiezaAccesorio } from './tipos'

/**
 * Escalera marinera: dos rieles verticales y peldaños (el plano de la escalera mira al centro del tanque),
 * más una jaula de aros y barras desde `alturaInicioJaula` hasta arriba. Va del fondo hasta pasar la boca.
 */
export function construirEscalera(d: DatosHomogeneizador): PiezaAccesorio[] {
  const e = d.accesorios.escalera
  const x = xEscalera(d)
  const tope = cotaTecho(d) + d.accesorios.bocaAcceso.alturaBrocal.valor + e.prolongacionSobreBoca.valor
  const mitadAncho = e.ancho.valor / 2
  const piezas: PiezaAccesorio[] = []

  for (const lado of [-1, 1]) {
    piezas.push(cilindroVertical(`escalera-riel-${lado}`, 'escalera-riel', x, lado * mitadAncho, 0, tope, RADIO_RIEL_ESCALERA))
  }
  const separacion = e.separacionPeldanos.valor
  for (let i = 1; i * separacion <= tope; i++) {
    piezas.push({
      id: `peldano-${i}`, tipo: 'peldano', forma: 'cilindro', radio: RADIO_PELDANO, largo: e.ancho.valor,
      posicion: [x, i * separacion, 0], rotacion: ACOSTADO_EN_Z,
    })
  }

  const radioJaula = e.diametroJaula.valor / 2
  const centroJaula = x - radioJaula + HOLGURA_JAULA_MURO
  const inicio = e.alturaInicioJaula.valor
  for (let i = 0; inicio + i * e.separacionAros.valor <= tope; i++) {
    piezas.push({
      id: `jaula-aro-${i}`, tipo: 'jaula', forma: 'anillo', radioInterior: radioJaula - GROSOR_ARO_JAULA, radioExterior: radioJaula,
      alto: GROSOR_ARO_JAULA, posicion: [centroJaula, inicio + i * e.separacionAros.valor, 0],
    })
  }
  const barras: [number, number][] = [[centroJaula, radioJaula], [centroJaula, -radioJaula], [centroJaula - radioJaula, 0]]
  barras.forEach(([bx, bz], i) => piezas.push(cilindroVertical(`jaula-barra-${i}`, 'jaula', bx, bz, inicio, tope, RADIO_BARRA_JAULA)))
  return piezas
}
