import { PASO_PERFIL } from '../../nucleo/constantesConexiones'
import type { TramoConexion } from './esquema'

export interface PuntoPerfil {
  x: number
  y: number
  /** Cota (m s.n.m.) del eje del tubo en este punto. */
  cota: number
  /** Distancia (m) recorrida desde el primer punto. */
  distancia: number
}

/** Largo (m) del tramo en planta. */
export function longitudTramo(t: TramoConexion): number {
  let total = 0
  for (let i = 1; i < t.trazado.length; i++) total += Math.hypot(t.trazado[i].x - t.trazado[i - 1].x, t.trazado[i].y - t.trazado[i - 1].y)
  return total
}

/** Distancia (m) de cada vértice al primer punto y su cota si la trae (los extremos usan la cota de salida y de llegada). */
function vertices(t: TramoConexion): { distancia: number; cota: number | undefined }[] {
  let recorrido = 0
  return t.trazado.map((p, i) => {
    if (i > 0) recorrido += Math.hypot(p.x - t.trazado[i - 1].x, p.y - t.trazado[i - 1].y)
    const cota = i === 0 ? t.cotaSalida.valor : i === t.trazado.length - 1 ? t.cotaLlegada.valor : p.cota
    return { distancia: recorrido, cota }
  })
}

/** Cota (m s.n.m.) a una distancia dada: entre dos vértices con cota conocida baja o sube en línea recta. */
export function cotaEn(t: TramoConexion, distancia: number): number {
  const conocidos = vertices(t).filter((v): v is { distancia: number; cota: number } => v.cota !== undefined)
  const d = Math.min(Math.max(distancia, 0), conocidos[conocidos.length - 1].distancia)
  const i = Math.max(1, conocidos.findIndex((v) => v.distancia >= d))
  const [a, b] = [conocidos[i - 1], conocidos[i]]
  const f = b.distancia === a.distancia ? 0 : (d - a.distancia) / (b.distancia - a.distancia)
  return a.cota + (b.cota - a.cota) * f
}

/** Puntos a lo largo del eje, cada `paso` metros y en cada vértice, con su cota. */
export function perfilTramo(t: TramoConexion, paso = PASO_PERFIL): PuntoPerfil[] {
  const perfil: PuntoPerfil[] = []
  let recorrido = 0
  perfil.push({ x: t.trazado[0].x, y: t.trazado[0].y, cota: cotaEn(t, 0), distancia: 0 })
  for (let i = 1; i < t.trazado.length; i++) {
    const [a, b] = [t.trazado[i - 1], t.trazado[i]]
    const largo = Math.hypot(b.x - a.x, b.y - a.y)
    const pasos = Math.max(1, Math.ceil(largo / paso))
    for (let k = 1; k <= pasos; k++) {
      const d = recorrido + (largo * k) / pasos
      perfil.push({ x: a.x + ((b.x - a.x) * k) / pasos, y: a.y + ((b.y - a.y) * k) / pasos, cota: cotaEn(t, d), distancia: d })
    }
    recorrido += largo
  }
  return perfil
}
