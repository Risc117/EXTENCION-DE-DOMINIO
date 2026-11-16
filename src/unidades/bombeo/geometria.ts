import { OPACIDAD_MURO } from '../../nucleo/constantes'
import { ALTURA_BARANDA_CANAL, GROSOR_BARANDA_CANAL, OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { COSENO_LADO_CASETA, POSTES_BARANDA_CARCAMO, SEPARACION_BARANDA_CARCAMO, VALVULA_COMPUERTA_DESDE, VALVULA_LARGO, VALVULA_RETENCION_DESDE, VALVULA_SEMIALTO, VALVULA_SEMIANCHO } from '../../nucleo/constantesCanales'
import { cajaEntre as caja } from '../comun/cajas'
import type { Agua, Pieza } from '../comun/tipos'
import { disponer } from './disposicion'
import type { DatosBombeo } from './esquema'

/** Cilindro entre dos puntos que difieren en un solo eje (tubería recta). */
function tubo(id: string, color: string, radio: number, eje: 'x' | 'y' | 'z', desde: number, hasta: number, fijo: [number, number, number]): Pieza {
  const centro = (desde + hasta) / 2
  const pos: [number, number, number] = eje === 'x' ? [centro, fijo[1], fijo[2]] : eje === 'y' ? [fijo[0], centro, fijo[2]] : [fijo[0], fijo[1], centro]
  return { id, forma: 'cilindro', color, pos, radio, alto: Math.abs(hasta - desde), eje }
}

/** Baranda circular abierta del lado de la caseta. */
function baranda(radio: number, base: number): Pieza[] {
  const g = GROSOR_BARANDA_CANAL
  const piezas: Pieza[] = []
  const paso = (2 * Math.PI) / POSTES_BARANDA_CARCAMO
  for (let i = 0; i < POSTES_BARANDA_CARCAMO; i++) {
    const a = i * paso
    if (Math.cos(a) > COSENO_LADO_CASETA) continue
    piezas.push({ id: `baranda-poste-${i}`, forma: 'caja', color: '--color-baranda', pos: [radio * Math.cos(a), base + ALTURA_BARANDA_CANAL / 2, radio * Math.sin(a)], tam: [g, ALTURA_BARANDA_CANAL, g], accesorio: true })
    const medio = a + paso / 2
    if (Math.cos(medio) > COSENO_LADO_CASETA) continue
    const cuerda = 2 * radio * Math.sin(paso / 2)
    piezas.push({
      id: `baranda-riel-${i}`,
      forma: 'caja',
      color: '--color-baranda',
      pos: [radio * Math.cos(medio) * Math.cos(paso / 2), base + ALTURA_BARANDA_CANAL - g / 2, radio * Math.sin(medio) * Math.cos(paso / 2)],
      tam: [cuerda, g, g],
      giroY: -(medio + Math.PI / 2),
      accesorio: true,
    })
  }
  return piezas
}

/** Estación de bombeo: cárcamo circular, bombas (verdes si están en marcha), tuberías, caseta de válvulas y baranda. Origen: centro del cárcamo, y = 0 en el fondo. */
export function construirPiezas(d: DatosBombeo, bombaActiva: number | null): Pieza[] {
  const s = disponer(d)
  const h = s.profundidad
  const rt = d.impulsion.diametro.valor / 2
  const c = d.caseta
  const e = c.espesorMuro.valor
  const ls = d.carcamo.espesorLosa.valor
  const caseta = { opacidad: OPACIDAD_CANAL }
  const zCaseta: [number, number] = [-c.ancho.valor / 2, c.ancho.valor / 2]
  const piezas: Pieza[] = [
    { id: 'losa-fondo', forma: 'cilindro', color: '--color-piso', pos: [0, -ls / 2, 0], radio: s.radioExterior, alto: ls },
    { id: 'muro-carcamo', forma: 'anillo', color: '--color-muro', pos: [0, 0, 0], radioInterior: s.radioInterior, radioExterior: s.radioExterior, alto: h, opacidad: OPACIDAD_MURO },
    caja('piso-caseta', '--color-solado', [s.xCasetaInicio, s.xCasetaFin], [h, h + e], zCaseta),
    caja('caseta-fondo', '--color-caseta', [s.xCasetaFin - e, s.xCasetaFin], [h + e, h + c.alto.valor], zCaseta, caseta),
    caja('caseta-lado-1', '--color-caseta', [s.xCasetaInicio, s.xCasetaFin], [h + e, h + c.alto.valor], [zCaseta[0], zCaseta[0] + e], caseta),
    caja('caseta-lado-2', '--color-caseta', [s.xCasetaInicio, s.xCasetaFin], [h + e, h + c.alto.valor], [zCaseta[1] - e, zCaseta[1]], caseta),
    caja('caseta-frente', '--color-caseta', [s.xCasetaInicio, s.xCasetaInicio + e], [h + e, h + c.alto.valor], zCaseta, caseta),
    caja('caseta-techo', '--color-caseta', [s.xCasetaInicio, s.xCasetaFin], [h + c.alto.valor, h + c.alto.valor + e], zCaseta, caseta),
    tubo('colector', '--color-impulsion', rt, 'z', s.zBombas[0], s.zBombas[s.zBombas.length - 1], [s.xCaseta, s.yColector, 0]),
    tubo('subida-impulsion', '--color-impulsion', rt, 'y', s.yColector, s.yImpulsion, [s.xCaseta, 0, 0]),
    tubo('impulsion', '--color-impulsion', rt, 'x', s.xCaseta, s.xCasetaFin + d.impulsion.largoTramo.valor, [0, s.yImpulsion, 0]),
    caja('valvula-compuerta', '--color-valvula', [s.xCaseta + VALVULA_COMPUERTA_DESDE, s.xCaseta + VALVULA_COMPUERTA_DESDE + VALVULA_LARGO], [s.yImpulsion - VALVULA_SEMIALTO, s.yImpulsion + VALVULA_SEMIALTO], [-VALVULA_SEMIANCHO, VALVULA_SEMIANCHO], { accesorio: true }),
    caja('valvula-retencion', '--color-valvula', [s.xCaseta + VALVULA_RETENCION_DESDE, s.xCaseta + VALVULA_RETENCION_DESDE + VALVULA_LARGO], [s.yImpulsion - VALVULA_SEMIALTO, s.yImpulsion + VALVULA_SEMIALTO], [-VALVULA_SEMIANCHO, VALVULA_SEMIANCHO], { accesorio: true }),
    ...baranda(s.radioExterior + SEPARACION_BARANDA_CARCAMO, h),
  ]
  for (const [i, z] of s.zBombas.entries()) {
    const color = i === bombaActiva ? '--color-bomba-marcha' : '--color-bomba-parada'
    const alto = d.bombas.alto.valor
    piezas.push(
      { id: `bomba-${i}`, forma: 'cilindro', color, pos: [s.xBombas, alto / 2, z], radio: d.bombas.diametro.valor / 2, alto },
      tubo(`subida-bomba-${i}`, '--color-impulsion', rt, 'y', alto, s.yColector, [s.xBombas, 0, z]),
      tubo(`salida-bomba-${i}`, '--color-impulsion', rt, 'x', s.xBombas, s.xCaseta, [0, s.yColector, z]),
    )
  }
  return piezas
}

/** Agua del cárcamo: un cilindro que sube y baja con el nivel de las bombas. */
export function construirAguas(d: DatosBombeo, nivel: number): Agua[] {
  const s = disponer(d)
  return [{ forma: 'cilindro', id: 'agua-carcamo', centro: [0, 0], radio: s.radioInterior, y0: 0, nivel: Math.min(nivel, s.profundidad) }]
}
