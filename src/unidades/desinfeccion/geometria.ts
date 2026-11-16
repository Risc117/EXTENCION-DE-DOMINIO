import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import { OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { FRACCION_PUNTO_APLICACION } from '../../nucleo/constantesDesinfeccion'
import { cajaEntre as caja } from '../comun/cajas'
import type { Agua, Pieza } from '../comun/tipos'
import { disponer } from './disposicion'
import type { DatosDesinfeccion } from './esquema'
import { nivelAgua, paso } from './hidraulica'

const CANALES = [1, 2, 3, 4]
const TABIQUES = [1, 2, 3]

/** x donde se aplica el cloro sobre la tubería de entrada (fuera del muro, aguas arriba de la cámara). */
export function xAplicacion(d: DatosDesinfeccion): number {
  const s = disponer(d)
  return -s.mitadLargo - PROLONGACION_TUBO + FRACCION_PUNTO_APLICACION * PROLONGACION_TUBO
}

/** Cámara de contacto armada desde datos/desinfeccion.json. `corte` = true vuelve translúcidos los muros y tabiques. */
export function construirPiezas(d: DatosDesinfeccion, corte = false): Pieza[] {
  const s = disponer(d)
  const e = d.muro.espesor.valor
  const t = d.tabique.espesor.valor
  const extra = corte ? { opacidad: OPACIDAD_CANAL } : {}
  const radioTubo = d.tuberias.diametro.valor / 2
  const largoTubo = e + PROLONGACION_TUBO
  const xTubo = -s.mitadLargoInterior - largoTubo / 2
  const yEntrada = s.yLosa + d.tuberias.alturaEjeEntrada.valor
  const c = d.cloracion
  const xA = xAplicacion(d)
  const yTope = yEntrada + radioTubo
  const yLinea = yTope + c.alturaPunto.valor
  const yValvula = yTope + c.alturaPunto.valor / 2
  const mitadValvula = c.largoValvula.valor / 2
  const pantalla = d.pantalla
  return [
    caja('losa', '--color-losa', [-s.mitadLargo, s.mitadLargo], [0, s.yLosa], [-s.mitadAncho, s.mitadAncho]),
    caja('muro-oeste', '--color-muro', [-s.mitadLargo, -s.mitadLargoInterior], [s.yLosa, s.yTope], [-s.mitadAncho, s.mitadAncho], extra),
    caja('muro-este', '--color-muro', [s.mitadLargoInterior, s.mitadLargo], [s.yLosa, s.yTope], [-s.mitadAncho, s.mitadAncho], extra),
    caja('muro-norte', '--color-muro', [-s.mitadLargoInterior, s.mitadLargoInterior], [s.yLosa, s.yTope], [-s.mitadAncho, -s.mitadAnchoInterior], extra),
    caja('muro-sur', '--color-muro', [-s.mitadLargoInterior, s.mitadLargoInterior], [s.yLosa, s.yTope], [s.mitadAnchoInterior, s.mitadAncho], extra),
    ...TABIQUES.map((k) => {
      const x = s.xTabique(k)
      const z = s.zTabique(k)
      return caja(`tabique-${k}`, '--color-muro', [x - d.tabique.largo.valor / 2, x + d.tabique.largo.valor / 2], [s.yLosa, s.yTope], [z - t / 2, z + t / 2], extra)
    }),
    // Pantalla (deflector) del paso 1-2: sin medida en el plano, de ejemplo.
    caja('pantalla', '--color-acceso', [s.xPaso(1) - pantalla.espesor.valor / 2, s.xPaso(1) + pantalla.espesor.valor / 2], [s.yLosa, s.yAgua], [s.zTabique(1) - pantalla.largo.valor / 2, s.zTabique(1) + pantalla.largo.valor / 2], { accesorio: true }),
    { id: 'tubo-entrada', forma: 'cilindro', color: '--color-ingreso', pos: [xTubo, yEntrada, s.zCanal(1)], radio: radioTubo, alto: largoTubo, eje: 'x' },
    { id: 'tubo-salida', forma: 'cilindro', color: '--color-salida', pos: [xTubo, s.yLosa + d.tuberias.alturaEjeSalida.valor, s.zCanal(4)], radio: radioTubo, alto: largoTubo, eje: 'x' },
    // Punto de aplicación del cloro sobre la tubería de entrada: línea de 1/2" que baja, válvula de retención y mezclador estático aguas abajo.
    { id: 'linea-cloro-vertical', forma: 'cilindro', color: '--color-impulsion', pos: [xA, (yTope + yLinea) / 2, s.zCanal(1)], radio: c.diametroLinea.valor / 2, alto: c.alturaPunto.valor, accesorio: true },
    caja('valvula-retencion', '--color-valvula', [xA - mitadValvula, xA + mitadValvula], [yValvula - mitadValvula, yValvula + mitadValvula], [s.zCanal(1) - mitadValvula, s.zCanal(1) + mitadValvula], { accesorio: true }),
    { id: 'mezclador', forma: 'cilindro', color: '--color-agitador', pos: [xA + c.largoMezclador.valor / 2 + c.diametroLinea.valor, yEntrada, s.zCanal(1)], radio: c.diametroMezclador.valor / 2, alto: c.largoMezclador.valor, eje: 'x', accesorio: true },
  ]
}

/**
 * Agua en orden de recorrido: canal 1, paso 1, canal 2, paso 2, canal 3, paso 3 y canal 4.
 * Cada canal corre todo el largo interior; cada paso es la franja del tabique donde el agua da la vuelta.
 */
export function construirAguas(d: DatosDesinfeccion, caudalLs: number): Agua[] {
  const s = disponer(d)
  const nivel = nivelAgua(d, caudalLs)
  const b = d.canales.ancho.valor
  const aguas: Agua[] = []
  for (const n of CANALES) {
    aguas.push({ forma: 'caja', id: `agua-canal-${n}`, centro: [0, s.zCanal(n)], largo: 2 * s.mitadLargoInterior, ancho: b, y0: s.yLosa, nivel })
    if (n < CANALES.length) {
      aguas.push({ forma: 'caja', id: `agua-paso-${n}`, centro: [s.xPaso(n), s.zTabique(n)], largo: paso(d), ancho: d.tabique.espesor.valor, y0: s.yLosa, nivel })
    }
  }
  return aguas
}
