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

const valorConFuente = z.object({
  valor: z.number().positive(),
  unidad: z.literal('L/s'),
  fuente: z.string().min(1),
  demo: z.boolean(),
})

/** Caudal de diseño de todo el sistema (datos/escalaCaudal.json). */
export const esquemaEscala = z.object({
  caudalPromedio: valorConFuente,
  caudalMaximoHorario: valorConFuente,
  motivo: z.string().min(1),
})

export type DatosEscala = z.infer<typeof esquemaEscala>

export type DatosHidrograma = z.infer<typeof esquemaHidrograma>

export interface Hidrograma {
  /** Números de día disponibles. */
  dias: number[]
  /** Horas que dura cada valor del caudal. */
  pasoHoras: number
  /** true si los datos son de ejemplo. */
  demo: boolean
  /** Caudal de entrada (L/s) del día a la hora simulada; constante dentro de cada paso. */
  caudalEntrada: (dia: number, hora: number) => number
  /** Número por el que se multiplicó el hidrograma original ese día (1 si no se escaló). */
  factorEscala: (dia: number) => number
  /** Caudal promedio de diseño del sistema (L/s); null si no se escaló. */
  caudalDiseno: number | null
  /** Por qué se escaló, tomado de los datos; null si no se escaló. */
  motivoEscala: string | null
  /** Promedio del día (L/s). */
  promedio: (dia: number) => number
}

export function crearHidrograma(crudo: unknown, escalaCruda?: unknown): Hidrograma {
  const datos = esquemaHidrograma.parse(crudo)
  const escala = escalaCruda === undefined ? null : esquemaEscala.parse(escalaCruda)
  const buscar = (n: number) => {
    const d = datos.dias.find((x) => x.dia === n)
    if (!d) throw new Error(`El hidrograma no tiene el día ${n}`)
    return d.caudal_ls_por_hora
  }
  const media = (q: number[]) => q.reduce((a, b) => a + b, 0) / q.length
  const factorDe = (n: number) => (escala ? escala.caudalPromedio.valor / media(buscar(n)) : 1)
  return {
    factorEscala: factorDe,
    caudalDiseno: escala ? escala.caudalPromedio.valor : null,
    motivoEscala: escala ? escala.motivo : null,
    dias: datos.dias.map((d) => d.dia),
    pasoHoras: datos.paso_horas,
    demo: datos.demo,
    caudalEntrada: (n, hora) => {
      const q = buscar(n)
      const horaDelDia = ((hora % HORAS_POR_DIA) + HORAS_POR_DIA) % HORAS_POR_DIA
      return q[Math.min(q.length - 1, Math.floor(horaDelDia / datos.paso_horas))] * factorDe(n)
    },
    promedio: (n) => {
      return media(buscar(n)) * factorDe(n)
    },
  }
}
