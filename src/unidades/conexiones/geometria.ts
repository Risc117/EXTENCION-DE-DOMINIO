import { COLOR_LINEA, LARGO_FLECHA_RADIOS, LARGO_MINIMO_FLECHA, RADIO_FLECHA_RADIOS, RADIO_MINIMO_TUBO, TOLERANCIA_ENTERRADO, type LineaConexion } from '../../nucleo/constantesConexiones'
import type { Vec3 } from '../comun/tiposAnotaciones'
import type { DatosConexiones, TramoConexion } from './esquema'
import { alturaTerreno } from '../comun/terrenoPlanta'
import { cotaEn } from './trazado'

export interface SegmentoTubo {
  a: Vec3
  b: Vec3
  /** true si el eje queda bajo el terreno de la escena (se dibuja con transparencia). */
  enterrado: boolean
}

export interface TuboCalculado {
  id: string
  linea: LineaConexion
  /** Variable de color de src/ui/tokens.css. */
  color: string
  radio: number
  segmentos: SegmentoTubo[]
}

export interface FlechaCalculada {
  id: string
  color: string
  pos: Vec3
  /** Vector unitario en el sentido del flujo (de `desde` a `hasta`). */
  direccion: Vec3
  largo: number
  radio: number
}

export interface BuzonCalculado {
  id: string
  /** Centro del cuerpo (m, escena). */
  pos: Vec3
  radio: number
  alto: number
  /** Punto central de la tapa. */
  tapa: Vec3
}

/** Punto de la escena (x este, y arriba, z sur) de un punto del plano (x este, y norte) a una cota. */
export const aEscena = (x: number, y: number, cota: number, referencia: number): Vec3 => [x, cota - referencia, -y]

function segmentosDe(t: TramoConexion, referencia: number, terrenoEn: (x: number, y: number) => number): SegmentoTubo[] {
  let recorrido = 0
  const segmentos: SegmentoTubo[] = []
  for (let i = 1; i < t.trazado.length; i++) {
    const [p, q] = [t.trazado[i - 1], t.trazado[i]]
    const largo = Math.hypot(q.x - p.x, q.y - p.y)
    const [c0, c1] = [cotaEn(t, recorrido), cotaEn(t, recorrido + largo)]
    const medio = (c0 + c1) / 2
    const [mx, my] = [(p.x + q.x) / 2, (p.y + q.y) / 2]
    segmentos.push({ a: aEscena(p.x, p.y, c0, referencia), b: aEscena(q.x, q.y, c1, referencia), enterrado: medio < terrenoEn(mx, my) - TOLERANCIA_ENTERRADO })
    recorrido += largo
  }
  return segmentos
}

/** Radio (m) con que se dibuja un tubo: el del diámetro, con un mínimo para que los delgados se vean. */
export const radioTubo = (t: TramoConexion): number => Math.max(t.diametro.valor / 2, RADIO_MINIMO_TUBO)

/** Los tubos de cada tramo, segmento por segmento, en coordenadas de la escena. */
export function construirTramos(d: DatosConexiones, referencia: number, terrenoEn: (x: number, y: number) => number = alturaTerreno): TuboCalculado[] {
  return d.tramos.map((t) => ({ id: t.id, linea: t.linea, color: COLOR_LINEA[t.linea], radio: radioTubo(t), segmentos: segmentosDe(t, referencia, terrenoEn) }))
}

/** Una flecha por tramo, sobre su segmento más largo, apuntando en el sentido del flujo. */
export function construirFlechas(d: DatosConexiones, referencia: number, terrenoEn: (x: number, y: number) => number = alturaTerreno): FlechaCalculada[] {
  return construirTramos(d, referencia, terrenoEn).map((tubo) => {
    const largo = (s: SegmentoTubo) => Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1], s.b[2] - s.a[2])
    const s = tubo.segmentos.reduce((mayor, x) => (largo(x) > largo(mayor) ? x : mayor))
    const l = largo(s)
    const direccion: Vec3 = [(s.b[0] - s.a[0]) / l, (s.b[1] - s.a[1]) / l, (s.b[2] - s.a[2]) / l]
    const pos: Vec3 = [(s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2, (s.a[2] + s.b[2]) / 2]
    return { id: tubo.id, color: tubo.color, pos, direccion, largo: Math.max(LARGO_MINIMO_FLECHA, tubo.radio * LARGO_FLECHA_RADIOS), radio: tubo.radio * RADIO_FLECHA_RADIOS }
  })
}

/** Buzones: cilindro desde su fondo hasta un poco sobre la tapa. */
export function construirBuzones(d: DatosConexiones, referencia: number): BuzonCalculado[] {
  const { profundidad, sobresale, diametroExterior } = d.buzon
  return d.puntos
    .filter((p) => p.tipo === 'buzon' && p.cotaTapa)
    .map((p) => {
      const tapa = p.cotaTapa!.valor
      const alto = profundidad.valor + sobresale.valor
      return { id: p.id, pos: aEscena(p.x.valor, p.y.valor, tapa + sobresale.valor - alto / 2, referencia), radio: diametroExterior.valor / 2, alto, tapa: aEscena(p.x.valor, p.y.valor, tapa + sobresale.valor, referencia) }
    })
}
