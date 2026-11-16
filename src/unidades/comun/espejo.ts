import type { CotaCalculada, EtiquetaCalculada, Vec3 } from './tiposAnotaciones'
import type { Agua, Pieza } from './tipos'

const z = (v: Vec3): Vec3 => [v[0], v[1], -v[2]]

/** Refleja una estructura respecto de su eje (z → −z): sirve cuando el plano pone un elemento del otro lado. */
export function espejarPiezas(piezas: Pieza[]): Pieza[] {
  return piezas.map((p) => ({ ...p, pos: z(p.pos), giroX: p.giroX === undefined ? undefined : -p.giroX }))
}

export function espejarAguas(aguas: Agua[]): Agua[] {
  return aguas.map((a) => (a.forma === 'cuna' || a.forma === 'anillo' ? a : { ...a, centro: [a.centro[0], -a.centro[1]] as [number, number] }))
}

export function espejarCotas(cotas: CotaCalculada[]): CotaCalculada[] {
  return cotas.map((c) => ({ ...c, a: z(c.a), b: z(c.b), centro: z(c.centro), extensiones: c.extensiones.map(([p, q]) => [z(p), z(q)] as [Vec3, Vec3]) }))
}

export function espejarEtiquetas(etiquetas: EtiquetaCalculada[]): EtiquetaCalculada[] {
  return etiquetas.map((e) => ({ ...e, origen: z(e.origen), punta: z(e.punta) }))
}
