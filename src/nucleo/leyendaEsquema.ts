import { z } from 'zod'

const fuente = z.string().min(1)

/** Leyenda del visor (datos/leyenda.json): cada entrada nombra un color de src/ui/tokens.css y su fuente. */
export const esquemaLeyenda = z
  .object({
    id: z.string().min(1),
    fuente,
    demo: z.boolean(),
    grupos: z
      .array(
        z.object({
          id: z.string().min(1),
          titulo: z.string().min(1),
          entradas: z.array(z.object({ id: z.string().min(1), nombre: z.string().min(1), token: z.string().regex(/^--color-[a-z0-9-]+$/), forma: z.enum(['linea', 'cuadro', 'circulo']), fuente })).min(1),
        }),
      )
      .min(1),
  })
  .refine((d) => {
    const ids = d.grupos.flatMap((g) => g.entradas.map((e) => e.id))
    return new Set(ids).size === ids.length
  }, 'Hay entradas repetidas')

export type DatosLeyenda = z.infer<typeof esquemaLeyenda>
