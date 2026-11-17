import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import { OPACIDAD_AGUA_CANAL, OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { ESPESOR_PARED_CAMARA_CENTRAL, ESPESOR_PASARELA, HOLGURA_AGUA_TOLVA, RADIO_EJE_PUENTE, SOBRESALIDO_PASARELA } from '../../nucleo/constantesSedimentador'
import { cajaEntre as caja } from '../comun/cajas'
import type { Agua, Pieza } from '../comun/tipos'
import { disponer } from './disposicion'
import { direccionPuerto, INSTANCIA_PRIMERA, puertosDe } from './puertos'
import type { DatosSedimentador } from './esquema'
import { laminaCanal } from './hidraulica'

/** Sedimentador completo armado desde datos/sedimentador.json (se instancia dos veces; `instancia` dice cuál, por la dirección de sus tubos). `corte` = true vuelve translúcidos los muros. El puente va aparte (gira). */
export function construirPiezas(d: DatosSedimentador, corte = false, instancia = INSTANCIA_PRIMERA): Pieza[] {
  const s = disponer(d)
  const t = d.tolva
  const e = d.tanque.espesorMuro.valor
  const extra = corte ? { opacidad: OPACIDAD_CANAL } : {}
  const rInf = t.diametroMenor.valor / 2
  const rLodo = rInf + ((s.radio - rInf) * t.alturaLodo.valor) / t.altura.valor
  const cc = d.camaraCentral
  const yCamara = s.yAgua - cc.altura.valor
  const yEntrada = d.tuberias.alturaEntrada.valor
  const largoTubo = s.radioCanalExterior + PROLONGACION_TUBO
  const pu = puertosDe(d, instancia)
  /** Tubo horizontal desde `desde` hasta `hasta` m del centro, en la dirección `grados` del puerto. */
  const radial = (id: string, color: string, grados: number, desde: number, hasta: number, y: number, diametro: number): Pieza => {
    const fi = direccionPuerto(grados)
    const centro = (desde + hasta) / 2
    return { id, forma: 'cilindro', color, pos: [centro * Math.cos(fi), y, centro * Math.sin(fi)], radio: diametro / 2, alto: hasta - desde, eje: 'x', giroY: -fi }
  }
  const pl = d.vertedero.espesorPlaca.valor
  const a = d.accesorios
  const rMampara = s.radio - a.separacionMampara.valor
  return [
    // La tolva es una superficie abierta; adentro van el agua y el manto de lodos.
    { id: 'tolva', forma: 'cono', color: '--color-muro', pos: [0, t.altura.valor / 2, 0], radioInferior: rInf, radioSuperior: s.radio, alto: t.altura.valor, abierto: true, ...extra },
    { id: 'agua-tolva', forma: 'cono', color: '--color-agua', pos: [0, t.altura.valor / 2, 0], radioInferior: rInf - HOLGURA_AGUA_TOLVA, radioSuperior: s.radio - HOLGURA_AGUA_TOLVA, alto: t.altura.valor, opacidad: OPACIDAD_AGUA_CANAL },
    { id: 'lodo', forma: 'cono', color: '--color-lodo', pos: [0, t.alturaLodo.valor / 2, 0], radioInferior: rInf - HOLGURA_AGUA_TOLVA, radioSuperior: rLodo, alto: t.alturaLodo.valor },
    { id: 'muro', forma: 'anillo', color: '--color-muro', pos: [0, s.yTolva, 0], radioInterior: s.radio, radioExterior: s.radioMuro, alto: s.yTope - s.yTolva, ...extra },
    { id: 'canal-piso', forma: 'anillo', color: '--color-piso', pos: [0, s.yCanalFondo, 0], radioInterior: s.radioMuro, radioExterior: s.radioCanalExterior, alto: e },
    { id: 'canal-muro', forma: 'anillo', color: '--color-muro', pos: [0, s.yCanalFondo, 0], radioInterior: s.radioCanalInterior, radioExterior: s.radioCanalExterior, alto: s.yTope - s.yCanalFondo, ...extra },
    // Placa del vertedero: las muescas en V no se dibujan, se cuentan (ver hidraulica.ts).
    { id: 'vertedero', forma: 'anillo', color: '--color-reja', pos: [0, s.yAgua + d.vertedero.profundidadMuesca.valor - d.vertedero.alturaPlaca.valor, 0], radioInterior: s.radio - pl, radioExterior: s.radio, alto: d.vertedero.alturaPlaca.valor },
    { id: 'mampara', forma: 'anillo', color: '--color-acceso', pos: [0, s.yAgua - a.alturaMampara.valor / 2, 0], radioInterior: rMampara - pl, radioExterior: rMampara, alto: a.alturaMampara.valor },
    { id: 'camara-central', forma: 'anillo', color: '--color-losa', pos: [0, yCamara, 0], radioInterior: cc.diametro.valor / 2 - ESPESOR_PARED_CAMARA_CENTRAL, radioExterior: cc.diametro.valor / 2, alto: cc.altura.valor },
    { id: 'deflector', forma: 'cilindro', color: '--color-muro', pos: [0, yCamara - cc.espesorDeflector.valor / 2, 0], radio: cc.diametroDeflector.valor / 2, alto: cc.espesorDeflector.valor },
    { id: 'tubo-alimentacion', forma: 'cilindro', color: '--color-ingreso', pos: [0, (yEntrada + yCamara) / 2, 0], radio: d.tuberias.diametroEntrada.valor / 2, alto: yCamara - yEntrada },
    radial('tubo-entrada', '--color-ingreso', pu.entrada.valor, 0, largoTubo, yEntrada, d.tuberias.diametroEntrada.valor),
    radial('tubo-purga', '--color-lodo', pu.purga.valor, 0, largoTubo, -d.tuberias.diametroPurga.valor / 2, d.tuberias.diametroPurga.valor),
    radial('tubo-salida', '--color-salida', pu.salida.valor, s.radioCanalExterior, largoTubo, s.yCanalFondo + e + d.tuberias.diametroSalida.valor / 2, d.tuberias.diametroSalida.valor),
    caja('pasarela', '--color-baranda', [0, s.radioCanalExterior + SOBRESALIDO_PASARELA], [s.yTope + a.altoPuente.valor, s.yTope + a.altoPuente.valor + ESPESOR_PASARELA], [-a.anchoPasarela.valor / 2, a.anchoPasarela.valor / 2], { accesorio: true }),
    caja('escalera', '--color-escalera', [s.radioCanalExterior, s.radioCanalExterior + ESPESOR_PASARELA], [s.yCanalFondo, s.yTope + a.alturaEscalera.valor], [-a.anchoEscalera.valor / 2, a.anchoEscalera.valor / 2], { accesorio: true }),
  ]
}

/** Puente barrendero: viga que cruza el tanque apoyada en el canal, y su eje. Gira alrededor del centro. */
export function construirPuente(d: DatosSedimentador): Pieza[] {
  const s = disponer(d)
  const a = d.accesorios
  return [
    caja('puente-viga', '--color-agitador', [-s.radioMuro, s.radioMuro], [s.yTope, s.yTope + a.altoPuente.valor], [-a.anchoPuente.valor / 2, a.anchoPuente.valor / 2]),
    { id: 'puente-eje', forma: 'cilindro', color: '--color-agitador', pos: [0, (d.tolva.alturaLodo.valor + s.yTope) / 2, 0], radio: RADIO_EJE_PUENTE, alto: s.yTope - d.tolva.alturaLodo.valor },
  ]
}

/** Agua: el tanque lleno hasta el vertedero y el canal perimetral con la lámina de la hoja según el caudal de la unidad. */
export function construirAguas(d: DatosSedimentador, caudalUnidadLs: number): Agua[] {
  const s = disponer(d)
  const aguas: Agua[] = [{ forma: 'cilindro', id: 'agua-tanque', centro: [0, 0], radio: s.radio, y0: s.yTolva, nivel: d.tanque.alturaAgua.valor }]
  const lamina = laminaCanal(d, caudalUnidadLs)
  if (lamina > 0) {
    aguas.push({ forma: 'anillo', id: 'agua-canal', radioInterior: s.radioMuro, radioExterior: s.radioCanalInterior, y0: s.yCanalFondo + d.tanque.espesorMuro.valor, nivel: lamina })
  }
  return aguas
}
