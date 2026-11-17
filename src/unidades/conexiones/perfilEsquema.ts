import { z } from 'zod'
import type { DatosConexiones } from './esquema'

const tramo = z.object({ tipo: z.literal('tramo'), id: z.string().min(1) })
const hueco = z.object({ tipo: z.literal('hueco'), unidades: z.array(z.string().min(1)).min(1) })

export const esquemaPerfil = z
  .object({
    id: z.string().min(1),
    fuente: z.string().min(1),
    demo: z.boolean(),
    /** Recorrido del agua: tramos de tubería y, entre ellos, las unidades por las que pasa. */
    cadena: z.array(z.discriminatedUnion('tipo', [tramo, hueco])).min(2),
    /** Tramos que repiten el perfil de otro (el segundo sedimentador) y no se dibujan aparte. */
    gemelos: z.object({ tramos: z.array(z.string().min(1)), fuente: z.string().min(1) }),
  })
  .refine((c) => c.cadena[0]?.tipo === 'tramo', 'La cadena debe empezar con un tramo (la entrada de agua)')

export type DatosCadena = z.infer<typeof esquemaPerfil>

/** Problemas de la cadena: un tramo o una unidad que no existe, o que no empieza donde terminó lo anterior. */
export function problemasCadena(c: DatosCadena, d: DatosConexiones, idsUnidades: string[]): string[] {
  const problemas: string[] = []
  let fin: string | null = null
  for (const item of c.cadena) {
    if (item.tipo === 'tramo') {
      const t = d.tramos.find((x) => x.id === item.id)
      if (!t) {
        problemas.push(`El tramo ${item.id} no existe`)
        continue
      }
      if (fin !== null && t.desde !== fin) problemas.push(`${t.id} empieza en ${t.desde} y lo anterior terminó en ${fin}`)
      fin = t.hasta
    } else {
      for (const u of item.unidades) if (!idsUnidades.includes(u)) problemas.push(`La unidad ${u} no existe`)
      if (fin !== null && item.unidades[0] !== fin) problemas.push(`El hueco empieza en ${item.unidades[0]} y lo anterior terminó en ${fin}`)
      fin = item.unidades[item.unidades.length - 1]
    }
  }
  return problemas
}
