import { z } from 'zod'
import type { PasoDemo } from '../estado/demo'
import type { ParametrosTanque } from '../estado/simulacion'
import type { Hidrograma } from './hidrograma'
import { volumenRequerido } from './requerido'

const paso = z.object({
  titulo: z.string().min(1),
  texto: z.string().min(1),
  duracionSegundos: z.number().positive(),
  vista: z.object({ acimut: z.number(), elevacion: z.number(), distancia: z.number().positive() }),
  accion: z.object({
    dia: z.number().int().positive().optional(),
    velocidad: z.number().positive().optional(),
    modoSalida: z.enum(['constante', 'gravedad']).optional(),
    salidaAjuste: z.number().nonnegative().nullable().optional(),
  }),
})

export const esquemaGuion = z.object({
  fuente: z.string().min(1),
  demo: z.boolean(),
  pasos: z.array(paso).min(1),
})

/** Lee y valida datos/demo.json; devuelve los pasos. */
export function crearGuion(crudo: unknown): PasoDemo[] {
  return esquemaGuion.parse(crudo).pasos
}

/** Valores que los textos pueden usar como {marcador}. Salen de los datos, no se escriben a mano. */
export function valoresDemo(tanque: ParametrosTanque, hidro: Hidrograma, dia: number): Record<string, number> {
  return {
    diametroInterior: 2 * Math.sqrt(tanque.area / Math.PI),
    alturaUtil: tanque.alturaUtil,
    volumenUtil: tanque.area * tanque.alturaUtil,
    volumenRequerido: volumenRequerido(hidro, dia),
    dia,
  }
}

/** Reemplaza {clave} o {clave:decimales} por su valor. Una clave desconocida es un error del guion. */
export function textoConValores(texto: string, valores: Record<string, number>): string {
  return texto.replace(/\{(\w+)(?::(\d+))?\}/g, (_, clave: string, decimales?: string) => {
    const v = valores[clave]
    if (v === undefined) throw new Error(`La demo usa un valor desconocido: {${clave}}`)
    return decimales === undefined ? String(Number(v.toFixed(2))) : v.toFixed(Number(decimales))
  })
}
