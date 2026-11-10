import { z } from 'zod'
import { HORAS_POR_DIA } from '../nucleo/constantes'

const dia = z.object({
  dia: z.number().int().positive(),
  caudal_ls_por_hora: z.array(z.number().nonnegative()).min(1),
})

export const esquemaHidrograma = z
  .object({
    fuente: z.string().min(1),
    demo: z.boolean(),
    unidad: z.literal('L/s'),
    paso_horas: z.number().positive(),
    dias: z.array(dia).min(1),
  })
  .refine(
    (h) => h.dias.every((d) => d.caudal_ls_por_hora.length === Math.round(HORAS_POR_DIA / h.paso_horas)),
    'Cada día debe traer un caudal por cada paso de 24 horas',
  )

export type DatosHidrograma = z.infer<typeof esquemaHidrograma>

export interface Hidrograma {
  /** Números de día disponibles. */
  dias: number[]
  /** true si los datos son de ejemplo. */
  demo: boolean
  /** Caudal de entrada (L/s) del día a la hora simulada; constante dentro de cada paso. */
  caudalEntrada: (dia: number, hora: number) => number
  /** Promedio del día (L/s). */
  promedio: (dia: number) => number
}

export function crearHidrograma(crudo: unknown): Hidrograma {
  const datos = esquemaHidrograma.parse(crudo)
  const buscar = (n: number) => {
    const d = datos.dias.find((x) => x.dia === n)
    if (!d) throw new Error(`El hidrograma no tiene el día ${n}`)
    return d.caudal_ls_por_hora
  }
  return {
    dias: datos.dias.map((d) => d.dia),
    demo: datos.demo,
    caudalEntrada: (n, hora) => {
      const q = buscar(n)
      const horaDelDia = ((hora % HORAS_POR_DIA) + HORAS_POR_DIA) % HORAS_POR_DIA
      return q[Math.min(q.length - 1, Math.floor(horaDelDia / datos.paso_horas))]
    },
    promedio: (n) => {
      const q = buscar(n)
      return q.reduce((a, b) => a + b, 0) / q.length
    },
  }
}
