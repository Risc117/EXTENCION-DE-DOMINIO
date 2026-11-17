import type { FuenteNivel } from '../../nucleo/terreno'
import { ELEVACION_PAVIMENTO, ENTERRADO_BASE, REDONDEO_COTA_PISO, SEGMENTOS_CIRCULO } from '../../nucleo/constantesEntorno'
import { TRANSICION_EXPLANADA } from '../../nucleo/terreno'
import { distanciaProtegida, zonasUnidades } from '../comun/protegido'
import type { DatosEntorno, PuntoPlano } from './esquema'
import { perfilSuave } from './perfilVia'

type TerrenoEn = (x: number, y: number) => number

/** Distancia (m) de un punto al borde de un polígono; 0 si está dentro. */
export function distanciaPoligono(x: number, y: number, p: PuntoPlano[]): number {
  let dentro = false
  let minimo = Number.POSITIVE_INFINITY
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [a, b] = [p[j], p[i]]
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) dentro = !dentro
    minimo = Math.min(minimo, distanciaASegmento(x, y, a, b))
  }
  return dentro ? 0 : minimo
}

function distanciaASegmento(x: number, y: number, a: PuntoPlano, b: PuntoPlano): number {
  const [dx, dy] = [b.x - a.x, b.y - a.y]
  const l2 = dx * dx + dy * dy
  const f = l2 === 0 ? 0 : Math.min(1, Math.max(0, ((x - a.x) * dx + (y - a.y) * dy) / l2))
  return Math.hypot(x - (a.x + dx * f), y - (a.y + dy * f))
}

/** Cota de piso en corte: el MÍNIMO del terreno bajo la planta (o las plantas, si comparten plataforma; muestras cada `paso` m), redondeado hacia abajo a REDONDEO_COTA_PISO. */
export function cotaPisoCorte(poligonos: PuntoPlano[][], terrenoEn: TerrenoEn, paso = 1): number {
  const [xs, ys] = [poligonos.flat().map((p) => p.x), poligonos.flat().map((p) => p.y)]
  let minimo = Number.POSITIVE_INFINITY
  for (let x = Math.min(...xs); x <= Math.max(...xs); x += paso) {
    for (let y = Math.min(...ys); y <= Math.max(...ys); y += paso) {
      if (poligonos.some((p) => distanciaPoligono(x, y, p) === 0)) minimo = Math.min(minimo, terrenoEn(x, y))
    }
  }
  return Math.floor(minimo / REDONDEO_COTA_PISO + 1e-9) * REDONDEO_COTA_PISO
}

/** Polígono regular de `n` lados inscrito en un círculo (para tratar la rotonda como una plataforma). */
export function poligonoCirculo(centro: PuntoPlano, radio: number, n = SEGMENTOS_CIRCULO): PuntoPlano[] {
  return Array.from({ length: n }, (_, i) => ({ x: centro.x + radio * Math.cos((2 * Math.PI * i) / n), y: centro.y + radio * Math.sin((2 * Math.PI * i) / n) }))
}

export interface PlataformaNivel {
  id: string
  tipo: 'pavimento' | 'edificio'
  poligonos: PuntoPlano[][]
  cotaPiso: number
  /** true si la cota es Dato de ejemplo. */
  demo: boolean
}

/** Plataformas del entorno, en el orden en que se aplican: primero los pavimentos (estacionamiento y patio juntos, rotonda) y luego los edificios; los que comparten `plataforma` van juntos. */
export function plataformasDe(d: DatosEntorno): PlataformaNivel[] {
  const lista: PlataformaNivel[] = []
  const agregar = (tipo: PlataformaNivel['tipo'], id: string, poligono: PuntoPlano[], cota: { valor: number; demo?: boolean }) => {
    const existente = lista.find((p) => p.id === id)
    if (existente) existente.poligonos.push(poligono)
    else lista.push({ id, tipo, poligonos: [poligono], cotaPiso: cota.valor, demo: cota.demo === true })
  }
  for (const s of d.superficies) agregar('pavimento', s.plataforma ?? s.id, s.poligono, s.cotaPiso)
  for (const r of d.rotondas) agregar('pavimento', r.plataforma ?? r.id, poligonoCirculo(r.centro, r.radio.valor), r.cotaPiso)
  for (const e of d.edificios) agregar('edificio', e.plataforma ?? e.id, e.poligono, e.cotaPiso)
  return lista
}

/** Losa de un pavimento: delgada, con su espesor enterrado bajo el terreno nivelado y la cara de arriba a ras (un centímetro sobre la cota). Sin paredes. */
export function losaPavimento(cotaPiso: number, espesor: number): { base: number; alto: number } {
  return { base: cotaPiso - espesor, alto: espesor + ELEVACION_PAVIMENTO }
}

/** Bloque de un edificio: arranca en su piso (solo una cimentación enterrada) y sube su altura. Sin paredes de relleno bajo el piso. */
export function bloqueEdificio(cotaPiso: number, altura: number): { base: number; alto: number } {
  return { base: cotaPiso - ENTERRADO_BASE, alto: ENTERRADO_BASE + altura }
}

/** Plataforma plana de uno o más edificios: sus plantas más un borde plano de `borde` m, a la cota del piso. */
export function fuentePlataforma(id: string, poligonos: PuntoPlano[][], cotaPiso: number, borde: number, alcance: number): FuenteNivel {
  const [xs, ys] = [poligonos.flat().map((p) => p.x), poligonos.flat().map((p) => p.y)]
  return {
    id,
    caja: { xMin: Math.min(...xs) - alcance, xMax: Math.max(...xs) + alcance, yMin: Math.min(...ys) - alcance, yMax: Math.max(...ys) + alcance },
    en: (x, y) => ({ distancia: Math.max(0, Math.min(...poligonos.map((p) => distanciaPoligono(x, y, p))) - borde), cota: cotaPiso, libre: true }),
  }
}

export interface ParametrosVia {
  eje: PuntoPlano[]
  /** Ancho (m) de la vía y borde plano (m) a cada lado. */
  ancho: number
  borde: number
  paso: number
  ventana: number
  pendienteMaxima: number
  /** Unidades en cuya transición la vía solo se deja intacta donde toca una tubería o un buzón. */
  intactas: string[]
  /** Cota (m s.n.m.) con que parte la primera estación (la de otra vía con la que se cruza); sin ella parte de la cota suavizada del terreno. */
  cotaInicio?: number
}

export interface PerfilVia {
  /** Cota de la vía en cada estación y su posición. */
  estaciones: { x: number; y: number; cota: number; anclada: boolean }[]
  cumple: boolean
  /** Pendiente más fuerte (m por m) entre estaciones ancladas, que es la del terreno. */
  pendienteAnclada: number
}

/** Perfil de la vía: cotas del terreno cada `paso` m, suavizadas, solo cambia la altura (el trazado en planta es el del DXF). Se anclan (quedan a la cota del terreno, sin modificar) las estaciones dentro del piso plano de una unidad (su radio) y, en la transición de las unidades `intactas`, solo las que tocan una tubería o un buzón; el resto de la transición se suaviza. */
export function perfilVia(p: ParametrosVia, terrenoEn: TerrenoEn): PerfilVia {
  const puntos: PuntoPlano[] = []
  for (let i = 1; i < p.eje.length; i++) {
    const [a, b] = [p.eje[i - 1], p.eje[i]]
    const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / p.paso))
    for (let k = i === 1 ? 0 : 1; k <= n; k++) puntos.push({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n })
  }
  const ancladas = puntos.map((q) =>
    zonasUnidades.some((u) => {
      const d = Math.hypot(q.x - u.x, q.y - u.y)
      return d <= u.radio || (p.intactas.includes(u.id) && d <= u.radio + TRANSICION_EXPLANADA && distanciaProtegida(q.x, q.y) < p.ancho / 2)
    }),
  )
  const crudas = puntos.map((q) => terrenoEn(q.x, q.y))
  if (p.cotaInicio !== undefined) {
    crudas[0] = p.cotaInicio
    ancladas[0] = true
  }
  const { alturas, cumple, pendienteAnclada } = perfilSuave(crudas, p.paso, ancladas, p.ventana, p.pendienteMaxima)
  return { estaciones: puntos.map((q, i) => ({ ...q, cota: alturas[i], anclada: ancladas[i] })), cumple, pendienteAnclada }
}

/** La vía como fuente de nivel: cota del perfil en la estación más cercana (interpolada en su tramo); los puntos cuyo tramo está anclado no cuentan para la holgura. */
export function fuenteVia(id: string, perfil: PerfilVia, ancho: number, borde: number, alcance: number): FuenteNivel {
  const e = perfil.estaciones
  const [xs, ys] = [e.map((q) => q.x), e.map((q) => q.y)]
  return {
    id,
    caja: { xMin: Math.min(...xs) - alcance, xMax: Math.max(...xs) + alcance, yMin: Math.min(...ys) - alcance, yMax: Math.max(...ys) + alcance },
    en: (x, y) => {
      const m = tramoMasCercano(perfil, x, y)
      return { distancia: Math.max(0, m.distancia - ancho / 2 - borde), cota: m.cota, libre: m.libre }
    },
  }
}

/** El tramo del perfil más cercano a (x, y): su distancia, la cota interpolada ahí y si ninguna de sus dos estaciones está anclada. */
function tramoMasCercano(perfil: PerfilVia, x: number, y: number): { distancia: number; cota: number; libre: boolean } {
  const e = perfil.estaciones
  let mejor = { distancia: Number.POSITIVE_INFINITY, cota: e[0].cota, libre: true }
  for (let i = 1; i < e.length; i++) {
    const [a, b] = [e[i - 1], e[i]]
    const [dx, dy] = [b.x - a.x, b.y - a.y]
    const l2 = dx * dx + dy * dy
    const f = l2 === 0 ? 0 : Math.min(1, Math.max(0, ((x - a.x) * dx + (y - a.y) * dy) / l2))
    const distancia = Math.hypot(x - (a.x + dx * f), y - (a.y + dy * f))
    if (distancia < mejor.distancia) mejor = { distancia, cota: a.cota + (b.cota - a.cota) * f, libre: !a.anclada && !b.anclada }
  }
  return mejor
}

/** Cota (m s.n.m.) del perfil de la vía en (x, y): la de la estación más cercana, interpolada en su tramo. */
export function cotaEnPerfil(perfil: PerfilVia, x: number, y: number): number {
  return tramoMasCercano(perfil, x, y).cota
}
