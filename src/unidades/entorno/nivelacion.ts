import type { FuenteNivel } from '../../nucleo/terreno'
import { REDONDEO_COTA_PISO } from '../../nucleo/constantesEntorno'
import { TRANSICION_EXPLANADA } from '../../nucleo/terreno'
import { distanciaProtegida, zonasUnidades } from '../comun/protegido'
import type { PuntoPlano } from './esquema'
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

/** Cota de piso derivada: promedio del terreno bajo la planta (o las plantas, si comparten plataforma) (muestras cada `paso` m), redondeado a REDONDEO_COTA_PISO. */
export function cotaPisoDerivada(poligonos: PuntoPlano[][], terrenoEn: TerrenoEn, paso = 1): number {
  const [xs, ys] = [poligonos.flat().map((p) => p.x), poligonos.flat().map((p) => p.y)]
  let suma = 0
  let n = 0
  for (let x = Math.min(...xs); x <= Math.max(...xs); x += paso) {
    for (let y = Math.min(...ys); y <= Math.max(...ys); y += paso) {
      if (poligonos.some((p) => distanciaPoligono(x, y, p) === 0)) {
        suma += terrenoEn(x, y)
        n++
      }
    }
  }
  return Math.round(suma / n / REDONDEO_COTA_PISO) * REDONDEO_COTA_PISO
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
  const { alturas, cumple, pendienteAnclada } = perfilSuave(puntos.map((q) => terrenoEn(q.x, q.y)), p.paso, ancladas, p.ventana, p.pendienteMaxima)
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
