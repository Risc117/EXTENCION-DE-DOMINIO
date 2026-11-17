import { z } from 'zod'
import crudo from '../../datos/mezclaRio.json'
import type { Concentracion } from '../estado/calidadAgua'
import { useMezclaRio, type DiferenciaDescarga, type EscenarioMezcla, type FilaMezcla, type ParametroMezcla } from '../estado/mezclaRio'

const fuente = z.string().min(1)
const valor = (unidad: string) => z.object({ valor: z.number().positive(), unidad: z.literal(unidad), fuente, demo: z.boolean() })
const limite = (unidad: string) => valor(unidad).extend({ tipo: z.enum(['maximo', 'minimo']) })
const mg = valor('mg/L')
const nmp = valor('NMP/100 mL')

/** Parámetros de la mezcla, en el orden en que se muestran. */
export const MEZCLA_PARAMETROS: readonly ParametroMezcla[] = ['dbo', 'dqo', 'sst', 'cf', 'od']

const concentraciones = z.object({ dbo: mg, dqo: mg, sst: mg, cf: nmp, od: mg })

/** Datos de la mezcla de la descarga con el río (datos/mezclaRio.json), de la memoria descriptiva, sección 18. */
export const esquemaMezcla = z
  .object({
    id: z.string().min(1),
    fuente,
    demo: z.boolean(),
    rio: z.string().min(1),
    descarga: concentraciones,
    escenarios: z.array(z.object({ id: z.string().min(1), nombre: z.string().min(1), caudalRio: valor('L/s'), mezcla: concentraciones })).min(1),
    limites: z.object({
      eca: z.object({ dbo: limite('mg/L'), dqo: limite('mg/L'), cf: limite('NMP/100 mL'), od: limite('mg/L') }),
      lmp: z.object({ dbo: limite('mg/L'), dqo: limite('mg/L'), sst: limite('mg/L'), cf: limite('NMP/100 mL') }),
    }),
  })
  .refine((d) => new Set(d.escenarios.map((e) => e.id)).size === d.escenarios.length, 'Hay escenarios repetidos')

export type DatosMezcla = z.infer<typeof esquemaMezcla>
export const mezclaRio = esquemaMezcla.parse(crudo)

interface Limite {
  valor: number
  tipo: 'maximo' | 'minimo'
}

/** Un máximo se cumple hasta su valor; un mínimo, desde su valor. */
export const cumpleLimite = (v: number, l: Limite): boolean => (l.tipo === 'maximo' ? v <= l.valor : v >= l.valor)

/** La mezcla de un escenario (estiaje o lluvia) parámetro por parámetro, contra el ECA y el LMP. */
export function evaluarMezcla(d: DatosMezcla, escenario: string): FilaMezcla[] {
  const e = d.escenarios.find((x) => x.id === escenario)
  if (!e) throw new Error(`No hay un escenario "${escenario}" en datos/mezclaRio.json`)
  const contra = (l: Limite | undefined, v: number) => (l ? { valor: l.valor, tipo: l.tipo, cumple: cumpleLimite(v, l) } : null)
  const eca: Partial<Record<ParametroMezcla, Limite>> = d.limites.eca
  const lmp: Partial<Record<ParametroMezcla, Limite>> = d.limites.lmp
  return MEZCLA_PARAMETROS.map((p) => ({ parametro: p, descarga: d.descarga[p].valor, mezcla: e.mezcla[p].valor, eca: contra(eca[p], e.mezcla[p].valor), lmp: contra(lmp[p], e.mezcla[p].valor) }))
}

/** Tolerancia relativa con la que se dice que dos cifras de la descarga coinciden. */
const TOLERANCIA_COINCIDE = 0.001

/** La descarga de la memoria (sección 18) contra la que da la cadena RAFA + percolador del visor: ambas cifras y su diferencia. */
export function diferenciasDescarga(d: DatosMezcla, visor: Concentracion): DiferenciaDescarga[] {
  return (['dbo', 'dqo', 'sst', 'cf'] as const).map((p) => {
    const memoria = d.descarga[p].valor
    return { parametro: p, memoria, visor: visor[p], diferencia: visor[p] - memoria, veces: visor[p] / memoria, coincide: Math.abs(visor[p] - memoria) / memoria < TOLERANCIA_COINCIDE }
  })
}

/** Evalúa la descarga con el río en cada escenario y la compara con la cadena del visor; lo publica para la interfaz. `visor` es la salida final de la cadena de calidad. */
export function publicarMezclaRio(visor: Concentracion): void {
  const escenarios: EscenarioMezcla[] = mezclaRio.escenarios.map((e) => ({ id: e.id, nombre: e.nombre, caudalRio: e.caudalRio.valor, filas: evaluarMezcla(mezclaRio, e.id) }))
  useMezclaRio.getState().publicar(mezclaRio.rio, mezclaRio.fuente, escenarios, diferenciasDescarga(mezclaRio, visor))
}
