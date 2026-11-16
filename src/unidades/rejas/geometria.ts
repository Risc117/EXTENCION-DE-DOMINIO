import { ALTURA_BARANDA_CANAL, GROSOR_BARANDA_CANAL, OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { cajaEntre as caja } from '../comun/cajas'
import type { Agua, Pieza } from '../comun/tipos'
import { disponer } from './disposicion'
import type { DatosRejas } from './esquema'
import { laminaBypass, tirante } from './hidraulica'

/** Las cajas más finas que esto (m) no se dibujan: la caja de recepción es tan ancha como el canal y sus muros de cierre quedan en cero. */
const TAMANO_MINIMO = 1e-6

/** Barras de la reja: se dibujan las que caben enteras, repartidas parejo a lo ancho del canal (z de cada una). */
export function posicionesBarras(d: DatosRejas): number[] {
  const n = Math.floor(d.reja.numeroBarras.valor)
  const b = d.canal.ancho.valor
  const hueco = (b - n * d.reja.espesorBarra.valor) / (n + 1)
  return Array.from({ length: n }, (_, i) => -b / 2 + hueco * (i + 1) + d.reja.espesorBarra.valor * (i + 0.5))
}

/** Estructura: losa, muros, recepción, reja con sus barras inclinadas, by-pass y accesorios. Origen: centro del canal, y = 0 en el piso. */
export function construirPiezas(d: DatosRejas): Pieza[] {
  const s = disponer(d)
  const e = d.canal.espesorMuro.valor
  const b = d.canal.ancho.valor
  const h = d.canal.alturaMuro.valor
  const rz = d.recepcion.ancho.valor / 2
  const muro = { opacidad: OPACIDAD_CANAL }
  const zIzq = -b / 2 - e / 2
  const piezas: Pieza[] = [
    caja('losa', '--color-piso', [s.xRecepcion - e, s.xFin + e], [-d.canal.espesorLosa.valor, 0], [-rz - e, s.zMuroExterior + e / 2]),
    caja('recepcion-fondo', '--color-muro', [s.xRecepcion - e, s.xRecepcion], [0, h], [-rz - e, rz + e], muro),
    caja('recepcion-lado-1', '--color-muro', [s.xRecepcion, s.xTransicion], [0, h], [-rz - e, -rz], muro),
    caja('recepcion-lado-2', '--color-muro', [s.xRecepcion, s.xTransicion], [0, h], [rz, rz + e], muro),
    caja('recepcion-frente-1', '--color-muro', [s.xTransicion - e, s.xTransicion], [0, h], [-rz, -b / 2], muro),
    caja('recepcion-frente-2', '--color-muro', [s.xTransicion - e, s.xTransicion], [0, h], [b / 2, rz], muro),
    caja('muro-izquierdo', '--color-muro', [s.xTransicion, s.xFin], [0, h], [zIzq - e / 2, zIzq + e / 2], muro),
    caja('muro-bypass-aguas-arriba', '--color-muro', [s.xTransicion, s.xVertedero[0]], [0, h], [s.zMuroDivisorio - e / 2, s.zMuroDivisorio + e / 2], muro),
    caja('vertedero-bypass', '--color-salida', s.xVertedero, [0, d.bypass.alturaCresta.valor], [s.zMuroDivisorio - e / 2, s.zMuroDivisorio + e / 2]),
    caja('muro-bypass-aguas-abajo', '--color-muro', [s.xVertedero[1], s.xFin], [0, h], [s.zMuroDivisorio - e / 2, s.zMuroDivisorio + e / 2], muro),
    caja('cierre-bypass', '--color-muro', [s.xTransicion, s.xTransicion + e], [0, h], [s.zMuroDivisorio, s.zMuroExterior], muro),
    caja('muro-exterior', '--color-muro', [s.xTransicion, s.xFin], [0, h], [s.zMuroExterior - e / 2, s.zMuroExterior + e / 2], muro),
  ]
  const angulo = (d.reja.angulo.valor * Math.PI) / 180
  const largo = d.reja.largo.valor
  for (const [i, z] of posicionesBarras(d).entries()) {
    piezas.push({
      id: `barra-${i}`,
      forma: 'caja',
      color: '--color-reja',
      pos: [s.xPieReja + (largo * Math.cos(angulo)) / 2, (largo * Math.sin(angulo)) / 2, z],
      tam: [d.reja.profundidadBarra.valor, largo, d.reja.espesorBarra.valor],
      giroZ: -(Math.PI / 2 - angulo),
    })
  }
  const g = GROSOR_BARANDA_CANAL
  const zb: [number, number] = [s.zMuroExterior - g / 2, s.zMuroExterior + g / 2]
  piezas.push(
    caja('bandeja-escurrido', '--color-acceso', [s.xCabezaReja, s.xCabezaReja + d.bandeja.largo.valor], [h - d.bandeja.hundimiento.valor, h], [-b / 2, b / 2], { accesorio: true }),
    caja('baranda-pasamanos', '--color-baranda', [s.xTransicion, s.xFin], [h + ALTURA_BARANDA_CANAL - g, h + ALTURA_BARANDA_CANAL], zb, { accesorio: true }),
    caja('baranda-poste-1', '--color-baranda', [s.xTransicion, s.xTransicion + g], [h, h + ALTURA_BARANDA_CANAL], zb, { accesorio: true }),
    caja('baranda-poste-2', '--color-baranda', [s.xFin - g, s.xFin], [h, h + ALTURA_BARANDA_CANAL], zb, { accesorio: true }),
  )
  return piezas.filter((p) => p.forma !== 'caja' || p.tam.every((v) => v > TAMANO_MINIMO))
}

/** Agua: en la recepción y el canal con el tirante del caudal; en el by-pass solo si rebasa el vertedero. */
export function construirAguas(d: DatosRejas, caudalLs: number): Agua[] {
  const s = disponer(d)
  const t = tirante(d, caudalLs)
  const largoCanal = s.xFin - s.xTransicion
  const lamina = laminaBypass(d, caudalLs)
  const aguas: Agua[] = [
    { forma: 'caja', id: 'agua-recepcion', centro: [(s.xRecepcion + s.xTransicion) / 2, 0], largo: s.xTransicion - s.xRecepcion, ancho: d.recepcion.ancho.valor, y0: 0, nivel: t },
    { forma: 'caja', id: 'agua-canal', centro: [s.xTransicion + largoCanal / 2, 0], largo: largoCanal, ancho: d.canal.ancho.valor, y0: 0, nivel: t },
  ]
  if (lamina > 0) {
    const largo = s.xFin - s.xVertedero[0]
    aguas.push({ forma: 'caja', id: 'agua-bypass', centro: [s.xVertedero[0] + largo / 2, s.zBypass], largo, ancho: d.bypass.anchoCanal.valor, y0: 0, nivel: lamina })
  }
  return aguas
}
