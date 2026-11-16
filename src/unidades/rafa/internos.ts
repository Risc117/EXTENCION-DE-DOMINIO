import { ALTURA_RAMAL_RAFA, LARGO_RAMAL_RAFA, RADIO_RAMAL_RAFA, SEPARACION_TOMAS_RAFA } from '../../nucleo/constantesRafa'
import { cajaEntre as caja } from '../comun/cajas'
import type { Pieza } from '../comun/tipos'
import { disponer } from './disposicion'
import type { DatosRafa } from './esquema'
import { anchoInterior } from './hidraulica'

/** x de la columna de tomas de lodo (m): a la mitad del tramo este del interior. */
export const xTomas = (d: DatosRafa): number => disponer(d).semiLargoInterior / 2

/** Lo de adentro: módulos con campanas, deflectores y canaletas; colector con ramales; tubos de fondo y tomas de lodo. */
export function construirInternos(d: DatosRafa): Pieza[] {
  const s = disponer(d)
  const sed = d.sedimentacion
  const e = sed.espesorDeflector.valor
  const largo = sed.modulos.largo.valor
  const yBase = s.yPiso + d.cuerpo.alturaDigestor.valor
  const piezas: Pieza[] = []
  let n = 0
  for (const z of s.zFilas) {
    for (const x of s.xModulos) {
      n++
      const alto = d.cuerpo.alturaSedimentacion.valor - sed.alturaRecta.valor
      // Campana: prisma simple, ancha abajo y angosta arriba (por donde sube el gas).
      piezas.push({ id: `modulo-${n}`, forma: 'prisma', color: '--color-solado', pos: [x, yBase + alto / 2, z], largo, anchoSuperior: e, anchoInferior: s.anchoModulo, alto })
      const zBorde = Math.sign(z) * (Math.abs(z) + s.anchoModulo / 2 + e / 2)
      piezas.push(caja(`deflector-${n}`, '--color-muro', [x - largo / 2, x + largo / 2], [yBase, yBase + sed.alturaDeflector.valor], [zBorde - e / 2, zBorde + e / 2]))
      const nc = sed.modulos.canaletasPorModulo.valor
      const w = s.anchoModulo / (2 * nc + 1)
      const yCanaleta = yBase + d.cuerpo.alturaSedimentacion.valor
      for (let k = 0; k < nc; k++) {
        const zc = z - s.anchoModulo / 2 + w * (1.5 + 2 * k)
        piezas.push(caja(`canaleta-${n}-${k + 1}`, '--color-losa', [x - largo / 2, x + largo / 2], [yCanaleta, yCanaleta + d.cuerpo.alturaCanaleta.valor], [zc - w / 2, zc + w / 2]))
      }
    }
  }
  const col = d.distribucion.colector
  const yColector = s.yPiso + col.alturaSobrePiso.valor
  const radioExterior = Math.min(d.distribucion.anchoColector.valor / 2, s.semiAnchoInterior) - col.holguraPared.valor
  const radioInterior = radioExterior - col.espesorAnillo.valor
  piezas.push({ id: 'colector', forma: 'anillo', color: '--color-impulsion', pos: [0, yColector, 0], radioInterior, radioExterior, alto: col.altoAnillo.valor })
  const ramales = d.distribucion.ramalesColector.valor
  for (let i = 0; i < ramales; i++) {
    const a = (2 * Math.PI * i) / ramales
    const r = radioInterior - LARGO_RAMAL_RAFA / 2
    piezas.push({ id: `ramal-${i + 1}`, forma: 'cilindro', color: '--color-impulsion', pos: [r * Math.cos(a), yColector + ALTURA_RAMAL_RAFA, r * Math.sin(a)], radio: RADIO_RAMAL_RAFA, alto: LARGO_RAMAL_RAFA, eje: 'x', giroY: -a })
  }
  const tubos = d.distribucion.tubosFondo
  for (let i = 0; i < tubos.cantidad.valor; i++) {
    const x = (i - (tubos.cantidad.valor - 1) / 2) * tubos.separacion.valor
    piezas.push({ id: `tubo-fondo-${i + 1}`, forma: 'cilindro', color: '--color-ingreso', pos: [x, s.yPiso + tubos.alturaSobrePiso.valor, 0], radio: tubos.diametro.valor / 2, alto: anchoInterior(d), eje: 'z' })
  }
  const largoToma = s.semiAncho - s.semiAnchoInterior + SEPARACION_TOMAS_RAFA
  for (const [i, h] of d.lodos.alturasToma.entries()) {
    piezas.push({ id: `toma-lodo-${i + 1}`, forma: 'cilindro', color: '--color-valvula', pos: [xTomas(d), s.yPiso + h.valor, -(s.semiAnchoInterior + largoToma / 2)], radio: d.lodos.diametroToma.valor / 2, alto: largoToma, eje: 'z', accesorio: true })
  }
  return piezas
}
