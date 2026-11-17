import { ALTO_TAPA_RAFA, GROSOR_BARANDA_RAFA } from '../../nucleo/constantesRafa'
import { OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { cajaEntre as caja } from '../comun/cajas'
import type { Agua, Pieza } from '../comun/tipos'
import { disponer } from './disposicion'
import type { DatosRafa } from './esquema'
import { seguridad } from '../comun/datosSeguridad'
import { construirExterior } from './exterior'
import { alturaInterior, anchoInterior, largoInterior, nivelAgua } from './hidraulica'
import { construirVereda } from './vereda'
import { construirInternos } from './internos'

/** Piso, cuatro muros de concreto (opacos; translúcidos solo con "Ver corte"), losa superior con tapas y baranda. */
function construirCuerpo(d: DatosRafa, corte: boolean): Pieza[] {
  const s = disponer(d)
  const g = GROSOR_BARANDA_RAFA
  const h = d.losa.alturaBaranda.valor
  const extra = corte ? { opacidad: OPACIDAD_CANAL } : {}
  const { semiLargo: L, semiAncho: A, semiLargoInterior: Li, semiAnchoInterior: Ai, yPiso, yMuros, yLosa } = s
  const piezas: Pieza[] = [
    caja('piso', '--color-piso', [-L, L], [0, yPiso], [-A, A]),
    caja('muro-norte', '--color-muro', [-L, L], [yPiso, yMuros], [Ai, A], extra),
    caja('muro-sur', '--color-muro', [-L, L], [yPiso, yMuros], [-A, -Ai], extra),
    caja('muro-oeste', '--color-muro', [-L, -Li], [yPiso, yMuros], [-A, A], extra),
    caja('muro-este', '--color-muro', [Li, L], [yPiso, yMuros], [-A, A], extra),
    caja('losa', '--color-losa', [-L, L], [yMuros, yLosa], [-A, A]),
  ]
  const nTapas = d.losa.cantidadTapas.valor
  const t = d.losa.anchoTapa.valor
  for (let i = 0; i < nTapas; i++) {
    const x = ((i + 0.5) / nTapas - 0.5) * 2 * Li
    piezas.push(caja(`tapa-${i + 1}`, '--color-acceso', [x - t / 2, x + t / 2], [yLosa, yLosa + ALTO_TAPA_RAFA], [-t / 2, t / 2]))
  }
  const alto: [number, number] = [yLosa, yLosa + h]
  const pasamanos: [number, number] = [yLosa + h - g, yLosa + h]
  piezas.push(
    caja('baranda-norte', '--color-baranda', [-L, L], pasamanos, [A - g, A], { accesorio: true }),
    caja('baranda-sur', '--color-baranda', [-L, L], pasamanos, [-A, -A + g], { accesorio: true }),
    caja('baranda-oeste', '--color-baranda', [-L, -L + g], pasamanos, [-A, A], { accesorio: true }),
    caja('baranda-este', '--color-baranda', [L - g, L], pasamanos, [-A, A], { accesorio: true }),
  )
  const esquinas: [number, number][] = [[-L, -A], [-L, A - g], [L - g, -A], [L - g, A - g]]
  for (const [i, [x, z]] of esquinas.entries()) {
    piezas.push(caja(`baranda-poste-${i + 1}`, '--color-baranda', [x, x + g], alto, [z, z + g], { accesorio: true }))
  }
  return piezas
}

/** RAFA completo armado desde datos/rafa.json. `corte` = true vuelve translúcidos los muros para ver adentro. */
export function construirPiezas(d: DatosRafa, corte = false): Pieza[] {
  return [...construirCuerpo(d, corte), ...construirInternos(d), ...construirExterior(d), ...construirVereda(d, seguridad.rafa)]
}

/** El agua del digestor: sube con el caudal (nivel de ejemplo, ver hidraulica.ts). */
export function construirAguas(d: DatosRafa, caudalLs: number, caudalMaximoLs: number): Agua[] {
  const nivel = Math.min(nivelAgua(d, caudalLs, caudalMaximoLs), alturaInterior(d))
  return [{ forma: 'caja', id: 'agua-digestor', centro: [0, 0], largo: largoInterior(d), ancho: anchoInterior(d), y0: d.cuerpo.espesorPiso.valor, nivel }]
}
