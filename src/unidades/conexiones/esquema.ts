import { z } from 'zod'
import { COLOR_LINEA, TOLERANCIA_BUZON } from '../../nucleo/constantesConexiones'
import { positivo } from '../comun/medidas'

const base = { fuente: z.string().min(1), demo: z.boolean().optional() }
const metros = positivo('m')
const coordenada = z.object({ valor: z.number().finite(), unidad: z.literal('m'), ...base })
const texto = z.object({ valor: z.string().min(1), ...base })
const lineas = Object.keys(COLOR_LINEA) as [keyof typeof COLOR_LINEA, ...(keyof typeof COLOR_LINEA)[]]

const punto = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  tipo: z.enum(['buzon', 'externo', 'puerto']),
  x: coordenada,
  y: coordenada,
  /** Cota (m s.n.m.) de la tapa del buzón. */
  cotaTapa: metros.optional(),
})

const tramo = z.object({
  id: z.string().min(1),
  linea: z.enum(lineas),
  /** Id de una unidad de planta.json o de un punto de este archivo. */
  desde: z.string().min(1),
  hasta: z.string().min(1),
  diametro: metros,
  material: texto,
  /** Puntos del eje del tubo en metros locales de planta.json (x este, y norte); `cota` (m s.n.m.) fija la cota en ese vértice, si no se interpola entre los extremos. */
  trazado: z.array(z.object({ x: z.number().finite(), y: z.number().finite(), cota: z.number().positive().optional() })).min(2),
  fuenteTrazado: z.string().min(1),
  cotaSalida: metros,
  cotaLlegada: metros,
  /** true si el perfil muestra el tubo sobre un relleno: puede quedar más alto que el terreno levantado (T16.4.6). */
  sobreRelleno: z.boolean().optional(),
})

export const esquemaConexiones = z
  .object({
    id: z.string().min(1),
    fuente: z.string().min(1),
    demo: z.boolean().optional(),
    buzon: z.object({ diametroExterior: metros, diametroInterior: metros, profundidad: metros, sobresale: metros }),
    cobertura: metros,
    puntos: z.array(punto).min(1),
    tramos: z.array(tramo).min(1),
  })
  .refine((d) => new Set(d.tramos.map((t) => t.id)).size === d.tramos.length, 'Hay ids de tramo repetidos')
  .refine((d) => new Set(d.puntos.map((p) => p.id)).size === d.puntos.length, 'Hay ids de punto repetidos')
  .refine((d) => d.puntos.every((p) => p.tipo !== 'buzon' || p.cotaTapa !== undefined), 'Cada buzón necesita su cota de tapa')
  .refine((d) => d.buzon.diametroInterior.valor < d.buzon.diametroExterior.valor, 'El diámetro interior del buzón debe ser menor que el exterior')

export type DatosConexiones = z.infer<typeof esquemaConexiones>
export type TramoConexion = DatosConexiones['tramos'][number]
export type PuntoConexion = DatosConexiones['puntos'][number]

/**
 * Problemas de referencias: un tramo debe unir dos puntos que existen (una unidad de planta.json o un punto del JSON),
 * y si empieza o termina en un punto del JSON, su primer o último punto debe caer en él.
 */
export function validarReferencias(d: DatosConexiones, idsUnidades: string[]): string[] {
  const problemas: string[] = []
  const punto = (id: string) => d.puntos.find((p) => p.id === id)
  for (const t of d.tramos) {
    for (const [lado, id, p] of [['desde', t.desde, t.trazado[0]], ['hasta', t.hasta, t.trazado[t.trazado.length - 1]]] as const) {
      const q = punto(id)
      if (!q && !idsUnidades.includes(id)) problemas.push(`${t.id}: "${id}" (${lado}) no es una unidad ni un punto`)
      if (q && Math.hypot(p.x - q.x.valor, p.y - q.y.valor) > TOLERANCIA_BUZON) problemas.push(`${t.id}: el ${lado === 'desde' ? 'primer' : 'último'} punto no cae en ${id}`)
    }
  }
  return problemas
}
